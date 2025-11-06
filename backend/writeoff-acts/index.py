"""
Business: API для управления актами списания
Args: event - dict с httpMethod, body
      context - объект с request_id
Returns: HTTP response с данными актов списания
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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                    SELECT id, act_number, act_date, responsible_person, 
                           reason, items, created_at, created_by, is_draft
                    FROM writeoff_acts
                    ORDER BY act_date DESC, created_at DESC
                ''')
                acts = cur.fetchall()
                
                for act in acts:
                    if act['act_date']:
                        act['act_date'] = act['act_date'].isoformat()
                    if act['created_at']:
                        act['created_at'] = act['created_at'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'acts': acts}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            act_number = body.get('act_number')
            act_date = body.get('act_date')
            responsible_person = body.get('responsible_person')
            reason = body.get('reason')
            items = body.get('items', [])
            created_by = body.get('created_by', 'Пользователь')
            is_draft = body.get('is_draft', False)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute('''
                    INSERT INTO writeoff_acts 
                    (act_number, act_date, responsible_person, reason, items, created_by, is_draft)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, act_number, act_date, created_at
                ''', (act_number, act_date, responsible_person, reason, json.dumps(items), created_by, is_draft))
                
                act = cur.fetchone()
                if act['act_date']:
                    act['act_date'] = act['act_date'].isoformat()
                if act['created_at']:
                    act['created_at'] = act['created_at'].isoformat()
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'act': act}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            act_id = params.get('id')
            
            if not act_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Act ID required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute('DELETE FROM writeoff_acts WHERE id = %s', (act_id,))
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()