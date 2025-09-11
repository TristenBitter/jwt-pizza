# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ----------------- | ---------------- | ------------ |
| View home page                                      | home.tsx          | none             | none |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx      | POST /api/auth   | `INSERT INTO users (name, email, password) VALUES (?, ?, ?)` <br/> `INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)` |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx         | PUT /api/auth    | `SELECT * FROM users WHERE email = ?` |
| Order pizza                                         | pizzaService.tsx  | GET /api/order/menu <br/> GET /api/franchise?page=0&limit=20&name=* | `SELECT * FROM menu` <br/> `SELECT * FROM franchise WHERE id = ? OR name LIKE ? LIMIT ?, ?` |
| Verify pizza                                        | delivery.tsx <br/> pizzaService.tsx | POST /api/order/verify | `INSERT INTO order_verifications (orderId, status, verifiedAt) VALUES (?, ?, ?)` |
| View profile page                                   | dinerDashboard.tsx | GET /api/order  | `SELECT * FROM orders WHERE userId = ?` |
| View franchise<br/>(as diner)                       | franchiseDashboard.tsx | GET /api/franchise/4 | `SELECT * FROM franchise WHERE id = ?` <br/> `SELECT * FROM store WHERE franchiseId = ?` |
| Logout                                              | logout.tsx        | DELETE /api/auth | none |
| View About page                                     | about.tsx         | GET photo image urls | none |
| View History page                                   | history.tsx       | GET mamaRicci.png | none |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx         | PUT /api/auth    | `SELECT * FROM users WHERE email = ?` <br/> `SELECT * FROM userRole WHERE userId = ?` |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx | GET /api/franchise/3 | `SELECT * FROM franchise WHERE id = ?` <br/> `SELECT * FROM store WHERE franchiseId = ?` |
| Create a store                                      | createStore.tsx   | POST /api/franchise/1/store | `INSERT INTO store (franchiseId, name, createdAt) VALUES (?, ?, ?)` |
| Close a store                                       | closeStore.tsx    | DELETE /api/franchise/1/store/2 | `DELETE FROM store WHERE id = ? AND franchiseId = ?` |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx         | PUT /api/auth    | `SELECT * FROM users WHERE email = ?` <br/> `SELECT * FROM userRole WHERE userId = ?` |
| View Admin page                                     | adminDashboard.tsx | GET /api/franchise?page=0&limit=3&name=* | `SELECT * FROM franchise LIMIT ?, ?` |
| Create a franchise for t@jwt.com                    | createFranchise.tsx | POST /api/franchise | `INSERT INTO franchise (name, admins, createdAt) VALUES (?, ?, ?)` |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | DELETE /api/franchise/2 | `DELETE FROM franchise WHERE id = ?` <br/> `DELETE FROM store WHERE franchiseId = ?` |
