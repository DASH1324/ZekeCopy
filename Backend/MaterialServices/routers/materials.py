from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List
from datetime import date
import httpx
from database import get_db_connection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:4000/auth/token")
router = APIRouter(prefix="/materials", tags=["materials"])

# threshold for stock status
thresholds = {
    "pcs": 10,
    "box": 5,
    "pack": 5,
}

def get_status(quantity: float, measurement: str):
    if quantity <= 0:
        return "Not Available"
    elif quantity <= thresholds.get(measurement, 1):
        return "Low Stock"
    return "Available"

# auth validation
async def validate_token_and_roles(token: str, allowed_roles: List[str], allowed_systems: List[str] = ["IMS"]):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "http://localhost:4000/auth/users/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    user_data = response.json()
    user_role = user_data.get("userRole")
    if user_role not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

# models
class MaterialCreate(BaseModel):
    MaterialName: str
    MaterialQuantity: float
    MaterialMeasurement: str
    DateAdded: date

class MaterialUpdate(BaseModel):
    MaterialName: str
    MaterialQuantity: float
    MaterialMeasurement: str
    DateAdded: date

class MaterialOut(BaseModel):
    MaterialID: int
    MaterialName: str
    MaterialQuantity: float
    MaterialMeasurement: str
    DateAdded: date
    Status: str

# get all materials
@router.get("/", response_model=List[MaterialOut])
async def get_all_materials(token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])
    
    conn = await get_db_connection()
    async with conn.cursor() as cursor:
        await cursor.execute("SELECT * FROM Materials")
        rows = await cursor.fetchall()
        return [
            {
                "MaterialID": row.MaterialID,
                "MaterialName": row.MaterialName,
                "MaterialQuantity": row.MaterialQuantity,
                "MaterialMeasurement": row.MaterialMeasurement,
                "DateAdded": row.DateAdded,
                "Status": row.Status
            }
            for row in rows
        ]

# create material
@router.post("/", response_model=MaterialOut)
async def add_material(material: MaterialCreate, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    conn = await get_db_connection()
    async with conn.cursor() as cursor:

        # duplicate check
        await cursor.execute("""
            SELECT 1 FROM Materials
            WHERE MaterialName COLLATE Latin1_General_CI_AS = ?
        """, material.MaterialName)
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Material name already exists.")

        status = get_status(material.MaterialQuantity, material.MaterialMeasurement)
        await cursor.execute("""
            INSERT INTO Materials (MaterialName, MaterialQuantity, MaterialMeasurement, DateAdded, Status)
            OUTPUT INSERTED.*
            VALUES (?, ?, ?, ?, ?)
        """, material.MaterialName, material.MaterialQuantity,
             material.MaterialMeasurement, material.DateAdded, status)
        row = await cursor.fetchone()
        return {
            "MaterialID": row.MaterialID,
            "MaterialName": row.MaterialName,
            "MaterialQuantity": row.MaterialQuantity,
            "MaterialMeasurement": row.MaterialMeasurement,
            "DateAdded": row.DateAdded,
            "Status": row.Status
        }

# update material
@router.put("/{material_id}", response_model=MaterialOut)
async def update_material(material_id: int, material: MaterialUpdate, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    conn = await get_db_connection()
    async with conn.cursor() as cursor:

        # duplicate check
        await cursor.execute("""
            SELECT 1 FROM Materials
            WHERE MaterialName COLLATE Latin1_General_CI_AS = ?
              AND MaterialID != ?
        """, material.MaterialName, material_id)
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Material name already exists.")

        status = get_status(material.MaterialQuantity, material.MaterialMeasurement)
        await cursor.execute("""
            UPDATE Materials
            SET MaterialName = ?, MaterialQuantity = ?, MaterialMeasurement = ?, DateAdded = ?, Status = ?
            WHERE MaterialID = ?
        """, material.MaterialName, material.MaterialQuantity,
             material.MaterialMeasurement, material.DateAdded, status, material_id)

        await cursor.execute("SELECT * FROM Materials WHERE MaterialID = ?", material_id)
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Material not found")

        return {
            "MaterialID": row.MaterialID,
            "MaterialName": row.MaterialName,
            "MaterialQuantity": row.MaterialQuantity,
            "MaterialMeasurement": row.MaterialMeasurement,
            "DateAdded": row.DateAdded,
            "Status": row.Status
        }

# delete material
@router.delete("/{material_id}")
async def delete_material(material_id: int, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    conn = await get_db_connection()
    async with conn.cursor() as cursor:
        await cursor.execute("DELETE FROM Materials WHERE MaterialID = ?", material_id)

    return {"message": "Material deleted successfully"}
