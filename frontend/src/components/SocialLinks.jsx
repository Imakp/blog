// components/SocialLinks.jsx
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faLinkedin,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const socials = [
  {
    name: "GitHub",
    url: "https://github.com/ankit",
    icon: faGithub,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ankit",
    icon: faLinkedin,
  },
  {
    name: "Twitter",
    url: "https://twitter.com/ankit",
    icon: faTwitter,
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@ankit",
    icon: faYoutube,
  },
];

export default function SocialLinks({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-4 rounded-lg ${
        isDark ? "bg-gray-800" : "bg-white"
      } shadow-md`}
    >
      <div className="flex justify-center gap-4">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-2xl transition-colors ${
              isDark
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            aria-label={social.name}
          >
            <FontAwesomeIcon icon={social.icon} />
          </a>
        ))}
      </div>
    </motion.div>
  );
}
