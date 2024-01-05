from telethon.sync import TelegramClient

api_id = '27054813'
api_hash = 'edf086cb306f411c3a46c7badf63f64d'
phone_number = '+84962145561'

with TelegramClient('session_name', api_id, api_hash) as client:
    client.start()
    dialogs = client.get_dialogs()
    
    for dialog in dialogs:
        if dialog.is_group:
            print(f"ID: {dialog.id}, Title: {dialog.title}")