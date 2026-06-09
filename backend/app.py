from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from utils.database import db
from controllers import materials_bp, calculator_bp, chimes_bp, statistics_bp, cost_bp
from models import Material, WindChime, TuningCorrection


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": "http://localhost:9201"}})

    db.init_app(app)

    with app.app_context():
        db.create_all()
        init_seed_data()

    app.register_blueprint(materials_bp)
    app.register_blueprint(calculator_bp)
    app.register_blueprint(chimes_bp)
    app.register_blueprint(statistics_bp)
    app.register_blueprint(cost_bp)

    @app.route("/api/health")
    def health_check():
        return jsonify({"status": "ok", "message": "Wind Chime API is running"})

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app


def init_seed_data():
    existing = Material.query.first()
    if existing:
        return

    seed_materials = [
        {
            "id": "mat_001",
            "material_type": "copper",
            "name": "长铜铃",
            "length": 180.0,
            "diameter": 25.0,
            "wall_thickness": 1.5,
            "theoretical_pitch": 523.25,
            "theoretical_note": "C5",
            "purchase_price": 85.5,
            "stock_quantity": 50,
            "loss_rate": 3.5,
            "supplier": "上海铜管厂"
        },
        {
            "id": "mat_002",
            "material_type": "aluminum",
            "name": "中音铝管",
            "length": 150.0,
            "diameter": 20.0,
            "wall_thickness": 1.0,
            "theoretical_pitch": 659.25,
            "theoretical_note": "E5",
            "purchase_price": 45.0,
            "stock_quantity": 80,
            "loss_rate": 2.0,
            "supplier": "广州铝材有限公司"
        },
        {
            "id": "mat_003",
            "material_type": "bamboo",
            "name": "竹制短管",
            "length": 120.0,
            "diameter": 22.0,
            "wall_thickness": 2.0,
            "theoretical_pitch": 783.99,
            "theoretical_note": "G5",
            "purchase_price": 28.0,
            "stock_quantity": 120,
            "loss_rate": 5.0,
            "supplier": "安吉竹制品厂"
        },
        {
            "id": "mat_004",
            "material_type": "glass",
            "name": "玻璃高音",
            "length": 100.0,
            "diameter": 18.0,
            "wall_thickness": 3.0,
            "theoretical_pitch": 1046.50,
            "theoretical_note": "C6",
            "purchase_price": 120.0,
            "stock_quantity": 30,
            "loss_rate": 8.0,
            "supplier": "淄博玻璃工艺厂"
        },
        {
            "id": "mat_005",
            "material_type": "copper",
            "name": "低音铜铃",
            "length": 220.0,
            "diameter": 30.0,
            "wall_thickness": 2.0,
            "theoretical_pitch": 392.00,
            "theoretical_note": "G4",
            "purchase_price": 150.0,
            "stock_quantity": 25,
            "loss_rate": 4.0,
            "supplier": "上海铜管厂"
        }
    ]

    for data in seed_materials:
        material = Material(**data)
        db.session.add(material)

    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=9202, debug=True)
