import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high" },
  { to: "/student/events", label: "Browse Events", icon: "fa-regular fa-calendar-check" },
  { to: "/student/my-events", label: "My Events", icon: "fa-solid fa-clipboard-list" },
];

const Sidebar = ({ className = "" }) => {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  return (
    <aside className={`sidebar ${className}`}>
      <nav>
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} className={isActive(item.to) ? "active" : ""}>
            <i className={item.icon} aria-hidden="true"></i>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;