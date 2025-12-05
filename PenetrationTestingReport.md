# Penetration Testing Report

#### Tristen Bitter, Josh Culmer

### Self Attack
  Tristen vs Tristen:
  - Friday, December 5, 2025
  - https://pizza.bamboogarden.click/
  - Severity Level 4  (I would say that this is a breach that can become critical if not properly addressed. )
  - OWASP level 7 attack (an Authentication failure/ weakness)
  
  - For my self-attack, I was able to hack in through the admin level using the Burp site to try many different passwords all at once using a brute force technique. I realized that my website was very vulnerable to hackers because of a weak password. In the future, I will make my passwords stronger to prevent this form of attack.
  - I changed the password in my database.js file and attempted to reset the database, but was unsuccessful before penetration began.
  - Below is an image of me gaining access to the admin using Burp, I got a response code 200. 
    <img width="2774" height="1744" alt="image" src="https://github.com/user-attachments/assets/48cee023-6124-4e9e-85f4-4f2a8beea3a6" />

### Peer Attack
  Tristen vs Josh: 
  - Friday, December 5, 2025
  - https://pizza.dancingdatabase.com/
  - Severity Level 4 (Pizzas Purchased for free
  - OWASP #4 - Insecure Design / OWASP #1 - Broken Access Control
  - I tried using the Repeater tool on Burp, and I was able to turn intercept on, and before his website could send a proper response, I edited the price of all the pizzas I ordered to be 0.00 Bitcoin. And I was able to buy many pizzas for free. This exploit did not steal user data, but it did rob the owner of pizzas, exploiting him in that way. This could be a critical problem in any business that needs to be addressed immediately; otherwise, they will lose money and go out of business quickly.
<img width="1280" height="1410" alt="image" src="https://github.com/user-attachments/assets/dd3a3eb5-f077-4bd3-a636-9d870b74556d" />


<img width="2658" height="1914" alt="image" src="https://github.com/user-attachments/assets/db2f828f-81c3-481f-bff8-fc0ef6f6cd54" />

  - Tristen vs Josh
  - Friday, December 5, 2025
  - https://pizza.dancingdatabase.com/
  - Severity Level 0 Unsuccessful
  - OWASP #3 Injection
  - I attempted SQL injection in the login endpoint (PUT /api/auth) using multiple payloads including ' OR '1'='1, admin' --, and a@jwt.com' --. All attempts returned standard "unknown user" error with no indication of SQL parsing or injection success. Application appears to use parameterized queries correctly, preventing SQL injection attacks.
    <img width="3144" height="1826" alt="image" src="https://github.com/user-attachments/assets/7d908d83-8410-41ff-80ac-f510d770c707" />

    


  
