import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления товарами на складе
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с request_id
    Returns: HTTP response с данными товаров
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    SELECT id, name, inventory_number, quantity, min_stock, price, batch, 
                           created_at, updated_at
                    FROM products
                    ORDER BY created_at DESC
                ''')
                products = cur.fetchall()
                
                for product in products:
                    product['price'] = float(product['price'])
                    if product['created_at']:
                        product['created_at'] = product['created_at'].isoformat()
                    if product['updated_at']:
                        product['updated_at'] = product['updated_at'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'products': products}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            inventory_number = body.get('inventory_number')
            quantity = int(body.get('quantity', 0))
            min_stock = int(body.get('min_stock', 0))
            price = float(body.get('price', 0))
            batch = body.get('batch', '')
            
            if not name or not inventory_number:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Заполните название и инвентарный номер'}),
                    'isBase64Encoded': False
                }
            
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "INSERT INTO products (name, inventory_number, quantity, min_stock, price, batch) VALUES ('" + 
                        str(name).replace("'", "''") + "', '" + 
                        str(inventory_number).replace("'", "''") + "', " + 
                        str(quantity) + ", " + 
                        str(min_stock) + ", " + 
                        str(price) + ", '" + 
                        str(batch).replace("'", "''") + "') " +
                        "RETURNING id, name, inventory_number, quantity, min_stock, price, batch, created_at"
                    )
                    
                    product = cur.fetchone()
                    product['price'] = float(product['price'])
                    if product['created_at']:
                        product['created_at'] = product['created_at'].isoformat()
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'product': product}),
                        'isBase64Encoded': False
                    }
            except psycopg2.IntegrityError as e:
                conn.rollback()
                error_msg = 'Товар с таким инвентарным номером уже существует'
                if 'unique' in str(e).lower():
                    error_msg = 'Товар с таким инвентарным номером уже существует'
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': error_msg}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('id')
            quantity = body.get('quantity')
            
            with conn.cursor() as cur:
                cur.execute('''
                    UPDATE products 
                    SET quantity = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (quantity, product_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()