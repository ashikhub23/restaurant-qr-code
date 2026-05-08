from flask import (Flask, render_template, request,
                   jsonify, redirect, session)
from functools import wraps

app = Flask(__name__)
app.secret_key = "secret123_change_in_production"

# ---------------- LOGIN SYSTEM ----------------

USERNAME = "admin"
PASSWORD = "1234"


# Decorator to protect admin routes
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("admin"):
            return redirect("/admin-login")
        return f(*args, **kwargs)
    return decorated_function


@app.route("/admin-login", methods=["GET", "POST"])
def admin_login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if username == USERNAME and password == PASSWORD:
            session["admin"] = True
            return redirect("/admin")
        else:
            error_msg = "Invalid username or password"
            return render_template("login.html",
                                   error=error_msg)

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("admin", None)
    return redirect("/admin-login")


# ---------------- MAIN WEBSITE ----------------

orders = []  # store orders


@app.route("/")
def home():
    table = request.args.get("table")
    return render_template("index.html", table=table)


@app.route("/place-order", methods=["POST"])
def place_order():
    try:
        data = request.json
        data["status"] = "Pending"
        orders.append(data)
        return jsonify({"message": "Order placed",
                        "success": True})
    except Exception as e:
        return jsonify({"message": str(e),
                        "success": False}), 400


# ---------------- ADMIN PANEL ----------------

@app.route("/admin")
@admin_required
def admin():
    return render_template("admin.html")


@app.route("/get-orders")
@admin_required
def get_orders():
    return jsonify(orders)


@app.route("/update-status", methods=["POST"])
@admin_required
def update_status():
    try:
        index = request.json["index"]
        status = request.json["status"]
        orders[index]["status"] = status
        return jsonify({"message": "Updated",
                        "success": True})
    except Exception as e:
        return jsonify({"message": str(e),
                        "success": False}), 400


# ---------------- TRACK PAGE ----------------

@app.route("/track")
def track():
    return render_template("track.html")


# ---------------- TABLE MANAGEMENT ----------------

@app.route("/tables")
@admin_required
def tables():
    return render_template("tables.html")


# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)