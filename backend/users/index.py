"""
Business: API для управления пользователями (CRUD операции)
Args: event - dict с httpMethod, body, pathParams
      context - объект с request_id
Returns: HTTP response с данными пользователей
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            user_id = event.get('pathParams', {}).get('id')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if user_id:
                    cur.execute('''
                        SELECT id, username, name, role, created_at
                        FROM t_p72161094_stock_management_exc.users
                        WHERE id = %s
                    ''', (user_id,))
                    user = cur.fetchone()
                    
                    if not user:
                        return {
                            'statusCode': 404,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'error': 'User not found'}),
                            'isBase64Encoded': False
                        }
                    
                    if user['created_at']:
                        user['created_at'] = user['created_at'].isoformat()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'user': user}),
                        'isBase64Encoded': False
                    }
                else:
                    cur.execute('''
                        SELECT id, username, name, role, created_at
                        FROM t_p72161094_stock_management_exc.users
                        ORDER BY created_at DESC
                    ''')
                    users = cur.fetchall()
                    
                    for user in users:
                        if user['created_at']:
                            user['created_at'] = user['created_at'].isoformat()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'users': users}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            password = body.get('password')
            name = body.get('name')
            role = body.get('role', 'user')
            
            if not username or not password or not name:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing required fields'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    INSERT INTO t_p72161094_stock_management_exc.users 
                    (username, password, name, role)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, username, name, role, created_at
                ''', (username, password, name, role))
                
                user = cur.fetchone()
                if user['created_at']:
                    user['created_at'] = user['created_at'].isoformat()
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'user': user}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            user_id = event.get('pathParams', {}).get('id')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User ID is required'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            username = body.get('username')
            password = body.get('password')
            name = body.get('name')
            role = body.get('role')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                update_fields = []
                params = []
                
                if username:
                    update_fields.append('username = %s')
                    params.append(username)
                if password:
                    update_fields.append('password = %s')
                    params.append(password)
                if name:
                    update_fields.append('name = %s')
                    params.append(name)
                if role:
                    update_fields.append('role = %s')
                    params.append(role)
                
                if not update_fields:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'No fields to update'}),
                        'isBase64Encoded': False
                    }
                
                params.append(user_id)
                query = f'''
                    UPDATE t_p72161094_stock_management_exc.users
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                    RETURNING id, username, name, role, created_at
                '''
                
                cur.execute(query, params)
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                if user['created_at']:
                    user['created_at'] = user['created_at'].isoformat()
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'user': user}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            user_id = event.get('pathParams', {}).get('id')
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User ID is required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute('''
                    DELETE FROM t_p72161094_stock_management_exc.users
                    WHERE id = %s
                ''', (user_id,))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'User deleted successfully'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()
