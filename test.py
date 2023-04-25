from selenium import webdriver
from selenium.webdriver.common.keys import Keys

# Set up Chrome webdriver
driver = webdriver.Chrome()

# Navigate to Google
approved = input('Do you approve navigating to Google? (y/n): ')
if approved.lower() == 'y':
    driver.get('https://www.google.com/')
else:
    driver.quit()

# Find the search box
approved = input('Do you approve finding the search box? (y/n): ')
if approved.lower() == 'y':
    search_box = driver.find_element('name', 'q')
else:
    driver.quit()

# Enter a query
approved = input('Do you approve entering the query "OpenAI"? (y/n): ')
if approved.lower() == 'y':
    search_box.send_keys('OpenAI')
else:
    driver.quit()

# Prompt user to approve the search before sending the return key
approved = input('Do you approve the search for "OpenAI"? (y/n): ')
if approved.lower() == 'y':
    search_box.send_keys(Keys.RETURN)

# Close the webdriver
driver.quit()
