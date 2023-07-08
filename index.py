from googletrans import Translator
import requests
from bs4 import BeautifulSoup

# Hàm dịch nội dung của một thẻ HTML
def translate_text(text):
    translator = Translator()
    translation = translator.translate(text, src='en', dest='vi')
    return translation.text

# Hàm dịch trang web từ tiếng Anh sang tiếng Việt
def translate_website(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Tìm tất cả các thẻ chứa nội dung cần dịch (ví dụ: <p>, <h1>, <h2>, ...)
    tags = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'])
    
    for tag in tags:
        # Kiểm tra xem thẻ có nội dung không trống
        if tag.string:
            translated_text = translate_text(tag.string)
            tag.string.replace_with(translated_text)
    
    # In nội dung trang web đã dịch
    print(soup)

# Gọi hàm dịch trang web
translate_website('https://www.cloudmqtt.com/docs/java.html')
