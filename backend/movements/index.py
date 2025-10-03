import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления операциями поступления и списания товаров
    Args: event - dict с httpMethod, body
          context - объект с request_id
    Returns: HTTP response с данными операций
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
                    SELECT m.id, m.movement_type, m.quantity, m.user_name, 
                           m.reason, m.supplier, m.notes, m.created_at,
                           p.name as product_name, p.sku
                    FROM movements m
                    JOIN products p ON m.product_id = p.id
                    ORDER BY m.created_at DESC
                    LIMIT 50
                ''')
                movements = cur.fetchall()
                
                for movement in movements:
                    if movement['created_at']:
                        movement['created_at'] = movement['created_at'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'movements': movements}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            product_id = body.get('product_id')
            movement_type = body.get('movement_type')
            quantity = body.get('quantity')
            user_name = body.get('user_name')
            reason = body.get('reason', '')
            supplier = body.get('supplier', '')
            notes = body.get('notes', '')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    INSERT INTO movements (product_id, movement_type, quantity, user_name, reason, supplier, notes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, movement_type, quantity, user_name, created_at
                ''', (product_id, movement_type, quantity, user_name, reason, supplier, notes))
                
                movement = cur.fetchone()
                if movement['created_at']:
                    movement['created_at'] = movement['created_at'].isoformat()
                
                quantity_change = quantity if movement_type == 'Поступление' else -quantity
                cur.execute('''
                    UPDATE products 
                    SET quantity = quantity + %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (quantity_change, product_id))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'movement': movement}),
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
