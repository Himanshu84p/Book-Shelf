Welcome to the BookShelf a online book store management system.
<br /><br /><br /><br />


**Features:** <br />

**Customer Management:** Allow customers to register, login, browse books, add them to a
cart, and complete purchases.<br />

**User roles**: admin,customer<br />

**Book Inventory Management:** Add, update, and delete books in the inventory with details
like title, author, genre, ISBN, quantity, price, etc.<br />

**Shopping Cart & Checkout:** Implemented a cart system for customers to add/remove books and
checkout securely.<br />

**Order Tracking:** Enable customers to track their orders and view their order history.<br />

**Admin Dashboard:** Provided admin dashboard to manage inventory, track
orders, and manage customer information.<br />

**Payment Integration:** Integrate a payment gateway to process customer transactions
securely.<br />
<br /><br /><br /><br />




**Technologies:**
Node.js, Express.js, Ejs, Javascript,HTML, CSS

**Database:**
MongoDB, for cloud(ATLAS)

**Libraries and Frameworks:**
Passport.js(Authentication), Bootstrap 5, MDB

**Payment Gateway:**
Razorpay payment intigration
<br /><br /><br /><br /><br />




**Setup to run on your local machine :**

Make a .env file in root folder where app.js resides.

chnages in app.js : change DbUrl to your mongodb local database link and chnage in mongoose.connect(<your local db url>).

In .env file define this 4 variable and give them value:

PORT = 8080<br />
SECRET = <any random secret string > <br />
KEY_SECRET = <razorpay key_secret> => get it from razorpay payment gateway go to razorpay signup and get your api key and secret <br />
KEY_ID = <razorpay api key > <br />

Thank you for reading.







