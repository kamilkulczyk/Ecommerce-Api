const handleLogin = async (event) => {
    event.preventDefault();
  
    const response = await fetch("https://ecommerce-api-production-1390.up.railway.app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await response.json();
  
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ username: data.username })); // Store username
      window.location.href = "/";
    } else {
      alert("Login failed!");
    }
  };
  