from typing import Generic, TypeVar, Type, Optional, List, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select, func

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db_session: Session):
        self.model = model
        self.db_session = db_session

    def get_by_id(self, id: str) -> Optional[ModelType]:
        return self.db_session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        result = self.db_session.execute(stmt)
        return list(result.scalars().all())

    def create(self, obj_in: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db_session.add(db_obj)
        self.db_session.flush()
        return db_obj

    def update(self, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        for field, value in obj_in.items():
            if value is not None:
                setattr(db_obj, field, value)
        self.db_session.flush()
        return db_obj

    def delete(self, id: str) -> bool:
        obj = self.get_by_id(id)
        if obj:
            self.db_session.delete(obj)
            self.db_session.flush()
            return True
        return False

    def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        result = self.db_session.execute(stmt)
        return int(result.scalar_one())
