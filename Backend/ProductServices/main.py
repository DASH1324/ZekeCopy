# main.py (in your 8001 service)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path

# Config logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Routers import
try:
    from routers import ProductType
    from routers import products
    logger.info("IMS: Successfully imported ProductType and products routers from 'routers' package.")
except ImportError as e:
    logger.error(f"IMS: Failed to import routers from 'routers' package: {e}. "
                 "Ensure 'routers/__init__.py', 'routers/ProductType.py', and 'routers/products.py' exist and are correct.")
    ProductType = None
    products = None

app = FastAPI(title="IMS Products API")

# --- FIX #1: Move CORS Middleware before including routers ---
# This ensures that the CORS headers are applied to every incoming request
# before it reaches the specific route logic.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://192.168.100.10:5000",
        "http://127.0.0.1:4000",
        "http://localhost:4000",
        # --- FIX #2: Uncommented the origin to allow both localhost and 127.0.0.1 ---
        "http://127.0.0.1:4001", 
        "http://localhost:4001",
        "http://localhost:9001",
        "http://127.0.0.1:9001",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("IMS: CORS middleware configured.")


# --- Static files to serve images to POS ---
IS_PROJECT_ROOT_DIR = Path(__file__).resolve().parent
PHYSICAL_STATIC_FILES_ROOT_TO_SERVE = IS_PROJECT_ROOT_DIR / "static_files"
URL_STATIC_MOUNT_PREFIX = "/static_files"
PHYSICAL_IMAGE_STORAGE_SUBDIR = PHYSICAL_STATIC_FILES_ROOT_TO_SERVE / "product_images"

if not PHYSICAL_IMAGE_STORAGE_SUBDIR.exists():
    try:
        PHYSICAL_IMAGE_STORAGE_SUBDIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"IMS: Created image storage subdirectory: {PHYSICAL_IMAGE_STORAGE_SUBDIR}")
    except OSError as e:
        logger.error(f"IMS: Error creating image subdirectory {PHYSICAL_IMAGE_STORAGE_SUBDIR}: {e}")

try:
    app.mount(
        URL_STATIC_MOUNT_PREFIX,
        StaticFiles(directory=PHYSICAL_STATIC_FILES_ROOT_TO_SERVE),
        name="is_static_content"
    )
    logger.info(f"IMS: Mounted IS static files from '{PHYSICAL_STATIC_FILES_ROOT_TO_SERVE}' at URL '{URL_STATIC_MOUNT_PREFIX}'")
except RuntimeError as e:
    logger.error(f"IMS: Failed to mount IS static files: {e}. Check directory '{PHYSICAL_STATIC_FILES_ROOT_TO_SERVE}'.")


# --- Include routers (AFTER middleware and static files) ---
if ProductType and hasattr(ProductType, 'router'):
    app.include_router(ProductType.router, prefix='/ProductType', tags=['Product Type'])
    logger.info("IMS: Included 'ProductType.router' with prefix '/ProductType'.")
else:
    logger.warning("IMS: 'ProductType.router' not loaded or has no 'router' attribute.")

if products and hasattr(products, 'router'):
    app.include_router(products.router, tags=['Products'])
    logger.info(f"IMS: Included 'products.router' (IMS Products) using its internal prefix '{getattr(products.router, 'prefix', 'N/A')}'.")
else:
    logger.warning("IMS: 'products.router' (IMS Products) not loaded or has no 'router' attribute.")


# --- Root endpoint ---
@app.get("/")
async def read_is_root():
    return {"message": "Welcome to the Inventory Management System API (IMS)."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8001, host="127.0.0.1", reload=True)
    logger.info("IMS Main: Starting Uvicorn server on http://127.0.0.1:8001")