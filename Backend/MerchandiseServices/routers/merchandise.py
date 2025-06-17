from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List
from datetime import date
import httpx
from database import get_db_connection

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:4000/auth/token")
router = APIRouter(prefix="/merchandise", tags=["merchandise"])

# threshold for stock status
def get_status(quantity: int) -> str:
    if quantity == 0:
        return "Not Available"
    elif quantity < 10:
        return "Low Stock"
    else:
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
    user_system = user_data.get("system")
    if user_role not in allowed_roles or user_system not in allowed_systems:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

# models
class MerchandiseCreate(BaseModel):
    MerchandiseName: str
    MerchandiseQuantity: int
    MerchandiseDateAdded: date

class MerchandiseUpdate(BaseModel):
    MerchandiseName: str
    MerchandiseQuantity: int
    MerchandiseDateAdded: date

class MerchandiseOut(BaseModel):
    MerchandiseID: int
    MerchandiseName: str
    MerchandiseQuantity: int
    MerchandiseDateAdded: date
    Status: str

# get all merchandise
@router.get("/", response_model=List[MerchandiseOut])
async def get_all_merchandise(token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])
    
    conn = await get_db_connection()
    async with conn.cursor() as cursor:
        await cursor.execute("SELECT * FROM Merchandise")
        rows = await cursor.fetchall()
        return [
            {
                "MerchandiseID": row.MerchandiseID,
                "MerchandiseName": row.MerchandiseName,
                "MerchandiseQuantity": row.MerchandiseQuantity,
                "MerchandiseDateAdded": row.MerchandiseDateAdded,
                "Status": row.Status
            }
            for row in rows
        ]

# create merchandise
@router.post("/", response_model=MerchandiseOut)
async def add_merchandise(data: MerchandiseCreate, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    status_value = get_status(data.MerchandiseQuantity)

    conn = await get_db_connection()
    async with conn.cursor() as cursor:
        
        # duplicate check
        await cursor.execute("""
            SELECT 1 FROM Merchandise
            WHERE MerchandiseName COLLATE Latin1_General_CI_AS = ?
        """, data.MerchandiseName)
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Merchandise name already exists.")

        await cursor.execute("""
            INSERT INTO Merchandise (MerchandiseName, MerchandiseQuantity, MerchandiseDateAdded, Status)
            OUTPUT INSERTED.*
            VALUES (?, ?, ?, ?)
        """, data.MerchandiseName, data.MerchandiseQuantity, data.MerchandiseDateAdded, status_value)

        row = await cursor.fetchone()
        return {
            "MerchandiseID": row.MerchandiseID,
            "MerchandiseName": row.MerchandiseName,
            "MerchandiseQuantity": row.MerchandiseQuantity,
            "MerchandiseDateAdded": row.MerchandiseDateAdded,
            "Status": row.Status
        }

# update merchandise
@router.put("/{merchandise_id}", response_model=MerchandiseOut)
async def update_merchandise(merchandise_id: int, data: MerchandiseUpdate, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    status_value = get_status(data.MerchandiseQuantity)

    conn = await get_db_connection()
    async with conn.cursor() as cursor:
       
       # duplicate check
        await cursor.execute("""
            SELECT 1 FROM Merchandise
            WHERE MerchandiseName COLLATE Latin1_General_CI_AS = ? 
              AND MerchandiseID != ?
        """, data.MerchandiseName, merchandise_id)
        if await cursor.fetchone():
            raise HTTPException(status_code=400, detail="Merchandise name already exists.")

        await cursor.execute("""
            UPDATE Merchandise
            SET MerchandiseName = ?, MerchandiseQuantity = ?, MerchandiseDateAdded = ?, Status = ?
            WHERE MerchandiseID = ?
        """, data.MerchandiseName, data.MerchandiseQuantity, data.MerchandiseDateAdded, status_value, merchandise_id)

        await cursor.execute("SELECT * FROM Merchandise WHERE MerchandiseID = ?", merchandise_id)
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Merchandise not found")

        return {
            "MerchandiseID": row.MerchandiseID,
            "MerchandiseName": row.MerchandiseName,
            "MerchandiseQuantity": row.MerchandiseQuantity,
            "MerchandiseDateAdded": row.MerchandiseDateAdded,
            "Status": row.Status
        }

# delete merchandise
@router.delete("/{merchandise_id}", response_model=dict)
async def delete_merchandise(merchandise_id: int, token: str = Depends(oauth2_scheme)):
    await validate_token_and_roles(token, ["admin", "manager", "staff"])

    conn = await get_db_connection()
    async with conn.cursor() as cursor:
        await cursor.execute("DELETE FROM Merchandise WHERE MerchandiseID = ?", merchandise_id)

    return {"message": "Merchandise deleted successfully"}
