import SmoothScroll from 'smooth-scroll'
import Glide from "@glidejs/glide";
import Stickyfill from "stickyfilljs";
import lity from 'lity';
import $ from "jquery";

const common = () => {

  // JavaScript to be fired on all pages
  // console.log(`.:: DEBUG ::. added code splitting to JS files.`);

  // Modal
  $(document).on('click', '[data-lightbox]', lity);

  const registerModal = $('#register-modal');
  console.log(`.:: DEBUG ::. registerModal: `, registerModal);

  let location;

  const handleLityModal = (instance) => {

    const registerButton = $(".header__cta-link");

    registerButton.on("click", function(e) {

      console.log(`.:: DEBUG ::. You clicked the Sign-in Button.`);

      setTimeout(() => {
        location = lity(instance);
        location.options('esc', false);
      }, 250);
    });

  }

  handleLityModal(registerModal);

  const scroll = new SmoothScroll('a[href*="#"]', {
    offset: 65,
  });

  // Open the Sign In modal
 const handleModal = () => {

   const registerButton = $(".header__cta-link");
  //  const registerButton = document.querySelector('.header__cta-link');
   const registerModal = $('.register-modal');
  //  const registerModal = document.querySelector('.register-modal');
   const modalCloseBtn = $('.register__close');
  //  const modalCloseBtn = document.querySelector('.register__close');
    const bodyClasses = Array.from(document.body.classList).toString();

   // open the modal
   const openModal = (e) => {

    registerButton.on("click", function(e) {
      console.log(`.:: DEBUG ::. You clicked the Sign-in Button.`);
      e.preventDefault();
      registerModal.removeClass('is-disabled');
     });

    //  registerButton.addEventListener('click', function (e) {
    //    console.log(`.:: DEBUG ::. You clickd the Register Button.`);
    //    e.preventDefault();
    //    registerModal.removeClass('is-disabled')
    //  });
   }

   openModal();

  // Close the Sign Up modal
   const closeModal = (e) => {
      e.preventDefault();
      registerModal.addClass('is-disabled')
    }

    modalCloseBtn.on('click', (e) => {
      closeModal(e);
    });
 }

  // Run em
  // Disabled in favor of lity library
  // handleModal();

};

export { common };
