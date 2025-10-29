git # 🌍 HNG Stage 2 — Country Currency & Exchange API

A RESTful API that fetches global country data and currency exchange rates from external APIs, caches them in a MySQL database, and exposes CRUD endpoints with computed GDP estimates.  

This project was built as part of the **HNG Internship Stage 2 Backend Task**.

---

## 🚀 Features

- Fetch country data from [REST Countries API](https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies)
- Fetch exchange rates from [Open Exchange Rate API](https://open.er-api.com/v6/latest/USD)
- Compute `estimated_gdp = population × random(1000–2000) ÷ exchange_rate`
- Cache country data in MySQL
- Provides CRUD endpoints:
  - Refresh and update cached countries
  - Filter and sort countries
  - Get a single country
  - Delete a country record
  - View refresh status and timestamp
- Generates a **summary image** showing:
  - Total countries
  - Top 5 countries by GDP
  - Last refresh timestamp

---

## 📂 Project Structure

```HNG-stage-2/
│── app.js
│── package.json
│── .env
│── .env.example
│── .gitignore
│── cache/
│ └── summary.png
│
│── controllers/
│ └── countryController.js
│
│── routes/
│ └── countryRoute.js
│
│── models/
│ ├── index.js
│ ├── Country.js
│ └── Status.js


---

## ⚙️ Tech Stack

- **Node.js (Express.js)** — Backend framework  
- **Sequelize ORM** — For interacting with MySQL  
- **MySQL** — Database for caching data  
- **Axios** — To fetch external APIs  
- **Canvas** — For generating the summary image  
- **dotenv & cors** — Environment setup and CORS support  
```
---

## 🧪 API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/countries/refresh` | Fetch and cache all countries and exchange rates |
| `GET` | `/countries` | Retrieve all countries (supports filters and sorting) |
| `GET` | `/countries/:name` | Retrieve a single country by name |
| `DELETE` | `/countries/:name` | Delete a country record |
| `GET` | `/status` | Show total countries and last refresh timestamp |
| `GET` | `/countries/image` | Serve the generated summary image |

---

## 🔍 Example Responses

### ✅ GET `/status`
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}

✅ GET /countries?region=Africa
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]

⚙️ Environment Variables

Create a .env file in the root directory.
You can use .env.example as a template:

DB_NAME=railway
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
PORT=3000

COUNTRY_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATE_API_URL=https://open.er-api.com/v6/latest/USD

🛠 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/HNG-stage-2.git
cd HNG-stage-2

2️⃣ Install Dependencies
npm install

3️⃣ Create Environment File
cp .env.example .env

4️⃣ Configure Database (MySQL)

Make sure you have MySQL installed locally and running.
Update your .env file with the correct credentials.

5️⃣ Run the App
npm run dev


App should be live at:
👉 http://localhost:3000

☁️ Deployment (Railway)
1️⃣ Push Code to GitHub
git add .
git commit -m "Stage 2 HNG Project"
git push origin main

2️⃣ Deploy to Railway

Visit https://railway.app

Create a new project → Deploy from GitHub

Select this repo and click Deploy

3️⃣ Add a MySQL Database on Railway

Click “+ New” → “Database” → “MySQL”

Copy the generated credentials.

4️⃣ Configure Environment Variables in Railway

Add the following keys:

Key	Value
DB_HOST	your-mysql-host
DB_USER	your-mysql-user
DB_PASSWORD	your-mysql-password
DB_NAME	your-mysql-database
PORT	3000
COUNTRY_API_URL	https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies

EXCHANGE_RATE_API_URL	https://open.er-api.com/v6/latest/USD
5️⃣ Redeploy

Click “Deploy latest commit” in your Railway dashboard.
Wait until it says ✅ “Deployed successfully”.

6️⃣ Get Your Public URL

Example:

https://hng-stage-2-production.up.railway.app

You can now test all endpoints live!

🧩 Error Handling
Status Code	Description
400	Validation failed (missing/invalid fields)
404	Country or resource not found
409	Conflict (duplicate entry)
422	Unprocessable entity
500	Internal server error
503	External data source unavailable
🧮 Validation Rules

name, population, and currency_code are required

If missing, respond with:

{
  "error": "Validation failed",
  "details": { "currency_code": "is required" }
}

🖼 Summary Image Example

After running /countries/refresh, an image is generated at:
cache/summary.png

Access it via
👉 GET /countries/image

If no image exists, the response will be:

{ "error": "Summary image not found" }


🧑🏽‍💻 Author

👤 *[Godly Patrick Udoh]
- Email: [Udohgary1999@gmail.com]
- LinkedIn: [(http://www.linkedin.com/in/godlypatrickudoh)]
- GitHub: [@GodlyPatrick](https://github.com/GodlyPatrick)

## 🎯 HNG Internship

This project is part of the [HNG Internship](https://hng.tech/internship) program.

Learn more about HNG:
- [HNG Internship](https://hng.tech/internship)
- [HNG Premium](https://hng.tech/premium)

## 🙏 Acknowledgments

- HNG Internship for the learning opportunity
- Express.js community for excellent documentation

---

*Built with ❤️ during HNG13 Internship*


