import * as React from "react";

interface ArrowLinkProps {
  href: string;
  text: string;
}

const ArrowLink: React.FC<ArrowLinkProps> = ({
  href,
  text,
}: ArrowLinkProps) => {
  return (
    <a href={href} className="arrow-link" title={text}>
      <span className="tri-block__link-text">{text}</span>
    </a>
  );
};

export default ArrowLink;
