import React from "react";

const TutorialBlock = () => {
  return (
    <section className="video-block" style={{ display: "none" }}>
      <div className="container">
        <div className="video-block__content">
          <div className="video-block__responsive-video">
            <iframe
              title="Tutorial Video"
              width="560"
              height="315"
              src="https://www.youtube.com/embed/FWtn2zGKPoI"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {/* <!-- <iframe width=“560” height=“315" src=“https://www.youtube.com/embed/FWtn2zGKPoI” frameborder=“0" allow=“accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture” allowfullscreen></iframe> --> */}
          </div>
          <div className="video-block__copy">
            <h2 className="video-block__title">
              Overall introduction to ImmuneSpace
            </h2>
            <p>
              This is the first tutorial that will introduce you to ImmuneSpace
              and show you how to register and login to the site. You will also
              learn about the main site navigation, how to reach important pages
              including the support page, and how to access the tutorials.
            </p>
            <a
              href="/"
              className="video-block__cta"
              title="Video tutorials link"
            >
              <span className="video-block__link-text">Video Tutorials</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorialBlock;
