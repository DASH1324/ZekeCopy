from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import os

# routers
from routers import users
from routers import auth

app = FastAPI(title="Retail Auth API")

# include routers
app.include_router(auth.router, prefix='/auth', tags=['auth'])
app.include_router(users.router, prefix='/users', tags=['users'])


# CORS setup to allow frontend and backend 
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # ims frontend
        "http://192.168.100.10:3000",  # ims frontend (local network)
        "http://127.0.0.1:8001",  # ims (productservice)
        "http://127.0.0.1:8002",  # ims (ingredientservice)
        "http://127.0.0.1:8003",  # ims (materialservice) 
        "http://127.0.0.1:8004",  # ims (merchandiseservice)
        "http://127.0.0.1:8005",  # ims (recipeservice)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# run app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=4000, host="127.0.0.1", reload=True)
