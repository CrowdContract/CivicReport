import { useTheme } from "../../context/theme";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = ({ className = "" }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="theme-toggle-slider"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon className="theme-toggle-icon" />
          ) : (
            <Sun className="theme-toggle-icon" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;