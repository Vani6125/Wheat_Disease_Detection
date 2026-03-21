import { Link } from "react-router-dom";
import { Wheat, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-agri-yellow rounded-full p-2">
                <Wheat className="h-6 w-6 text-primary" />
              </div>
              <span className="font-heading font-bold text-xl">AGRILENS</span>
            </div>
            <p className="text-primary-foreground/80 max-w-md">
              Empowering wheat farmers with AI-powered disease detection and
              precision agriculture tools for healthier crops and higher yields.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-primary-foreground/80 hover:text-agri-yellow transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-primary-foreground/80 hover:text-agri-yellow transition-colors"
                >
                  About Us
                </Link>
              </li>
              
              <li>
                <Link
                  to="/contact"
                  className="text-primary-foreground/80 hover:text-agri-yellow transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-agri-yellow" />
                <span className="text-primary-foreground/80">
                  support@agrilens.com
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-agri-yellow" />
                <span className="text-primary-foreground/80">
                  +91 XX-XXX-XXXX
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-agri-yellow mt-1" />
                <span className="text-primary-foreground/80">
                  Agricultural Tech Hub, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/60">
            © {new Date().getFullYear()} AgriLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
