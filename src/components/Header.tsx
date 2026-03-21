import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Wheat, User, Home, FlaskConical, LayoutDashboard, Cloud, Sprout, Bot, Sparkles, Info, Phone } from "lucide-react";
//import jwt_decode from "jwt-decode";
//const token = localStorage.getItem("token");

// interface JwtPayload {
//   id: number;
//   name: string;
//   phone: string;
//   //iat?: number;
//   //exp?: number;
// }

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  // let user: JwtPayload | null = null;
  //   const token = localStorage.getItem("token");
  // if (token) {
  //   try {
  //     //user = jwt_decode(token) as JwtPayload;
  //       decoded = jwt_decode<JwtPayload>(token);
  //     console.log(decoded);
  //   } catch (err) {
  //     console.error("Invalid token", err);
  //   }
  // }
  const isLoggedIn = !!user;

  // Public and private links
  const publicLinks = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
    { name: "Features", path: "#features", icon: <Sparkles className="h-4 w-4" /> },
    { name: "About us", path: "/about", icon: <Info className="h-4 w-4" /> },
    { name: "Contact us", path: "/contact", icon: <Phone className="h-4 w-4" /> },
  ];

  const privateLinks = [
    { name: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
    { name: "Model", path: "/model", icon: <FlaskConical className="h-4 w-4" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Weather Report", path: "/weather", icon: <Cloud className="h-4 w-4" /> },
    { name: "Fertilizer", path: "/field", icon: <Sprout className="h-4 w-4" /> },
    { name: "AI Assistant", path: "/ai-assistant", icon: <Bot className="h-4 w-4" /> },
  ];

  const navLinks = isLoggedIn ? privateLinks : publicLinks;

  const isActive = (path: string) => location.pathname === path;

  // Scroll to features
  const handleFeaturesClick = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "features" } });
    } else {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false); // close mobile menu if open
  };

  return (
    <header className="gradient-header sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-2">
              <Wheat className="h-6 w-6 text-agri-yellow" />
            </div>
            <span className="font-heading font-bold text-xl text-primary">
              AGRILENS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.name === "Features") {
                return (
                  <button
                    key={link.name}
                    onClick={handleFeaturesClick}
                    className="flex items-center gap-1.5 font-medium hover:text-primary text-foreground/80"
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </button>
                );
              } else {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 font-medium hover:text-primary ${
                      isActive(link.path)
                        ? "text-primary font-semibold"
                        : "text-foreground/80"
                    }`}
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </Link>
                );
              }
            })}

            {/* Auth */}
            {isLoggedIn ? (
              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="font-medium text-primary text-black">
                  Hi, {user.name}
                </span>
                <User className="h-6 w-6 text-primary text-black" />
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
              >
                Register / Login
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                if (link.name === "Features") {
                  return (
                    <button
                      key={link.name}
                      onClick={handleFeaturesClick}
                      className="flex items-center gap-2 text-left py-2 px-4 rounded-lg hover:bg-secondary"
                    >
                      {link.icon && link.icon}
                      {link.name}
                    </button>
                  );
                } else {
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-secondary"
                    >
                      {link.icon && link.icon}
                      {link.name}
                    </Link>
                  );
                }
              })}

              {/* Auth Mobile */}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="bg-primary text-primary-foreground py-2 rounded-lg"
                >
                  Hi, {user.name}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-primary text-primary-foreground py-2 rounded-lg text-center"
                >
                  Register / Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;