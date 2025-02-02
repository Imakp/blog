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
    url: "https://github.com/Imakp",
    icon: faGithub,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/ankitkumarpandit/",
    icon: faLinkedin,
  },
  {
    name: "Twitter",
    url: "https://x.com/_ankitkrpandit_",
    icon: faTwitter,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@ankit.kr.pandit",
    icon: faYoutube,
  },
];

export default function SocialLinks() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50"
    >
      <div className="flex justify-center gap-4">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            aria-label={social.name}
          >
            <FontAwesomeIcon icon={social.icon} />
          </a>
        ))}
      </div>
    </motion.div>
  );
}
