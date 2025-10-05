import style from "./Footer.module.css";

function Footer() {
  return (
    <footer className={style.footer}>
      <div className={style.mainContainer}>
        <div className={style.titlelogoContainer}>
          <div className={style.logoContainer}>
            <img className={style.schoolLogo} src="/assets/school-logo.svg" alt="school-logo" />
          </div>

          <div className={style.titleContainer}>
            <h1 className={style.title}>ACD Research Repository</h1>
            <p className={style.schoolName}>Assumption College of Davao</p>

            <p className={style.desktopDescription}>
              The official research repository of Assumption College of Davao, providing access to
              academic research and scholarly work.
            </p>
          </div>
        </div>

        <p className={style.mobileDescription}>
          The official research repository of Assumption College of Davao, providing access to
          academic research and scholarly work.
        </p>

        <div className={style.linkcontactContainer}>
          <div className={style.linksContainer}>
            <h3 className={style.links}>Links</h3>
            <a href="https://www.facebook.com/assumptiondavao.edu.ph">Facebook</a>
            <a href="https://github.com/r4ppz19/research-repository">Github</a>
            <a href="#">About</a>
          </div>

          <div className={style.contactContainer}>
            <h3 className={style.contact}>Contact</h3>
            <a href="mailto:research@acd.edu.ph">research@acd.edu.ph</a>
            <p>+63 82 123 4567</p>
            <p>Davao City, Philippines</p>
          </div>
        </div>
      </div>
      <h4 className={style.copyrightNotice}>
        &copy; {new Date().getFullYear()} Assumption College of Davao. All rights reserved.
      </h4>
    </footer>
  );
}

export default Footer;
