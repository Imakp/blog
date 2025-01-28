// components/SEO.jsx
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords }) => (
  <Helmet>
    <title>{title || "Default Title"}</title>
    <meta name="description" content={description || "Default description"} />
    <meta name="keywords" content={keywords || "default,keywords"} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
  </Helmet>
);

export default SEO;
