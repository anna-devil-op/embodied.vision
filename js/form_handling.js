---
# for Jekyll parsing
---

const contactModel = (function() {
  let _email = '';
  let _isValidEmail = false;
  let _name = '';
  let _message = '';
  let _interests = new Set();
  let _signupDetails = null;
  let _signupError = false;
  let _isSending = false;

  let _clear = () => {
    _email = '';
    _isValidEmail = false;
    _name = '';
    _message = '';
    _interests.clear();
  }

  let setEmail = (email) => { _email = email; _isValidEmail = (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(_email)); }

  let isValidEmail = () => _isValidEmail;

  let getEmail = () => _email;

  let setName = (name) => { _name = name }

  let getName = () => _name;

  let hasInterest = (interest) => _interests.has(interest);

  let setInterested = (interest, interested) => { (interested) ? _interests.add(interest) : _interests.delete(interest) }

  let setMessage = (message) => { _message = message }

  let getMessage = () => _message;

  let canSubmit = () => _email !== '' && _isValidEmail && _name !== '';

  let signupSuccessful = () => !_signupError;

  let getSignupDetails = () => _signupDetails;

  let isSending = () => _isSending;

  async function signup() {
    _isSending = true;
    _signupDetails = null;
    _signupError = false;
    let payload = {"email": _email, "name": _name, "interests": Array.from(_interests), "message": _message};
    m.request({
      method: "POST",
      url: "{{ site.contacts_url }}",
      body: payload,
    }).then(value => {
      _signupDetails = payload;
      _isSending = false;
      _clear();
    }, reason => {
      _signupError = true;
      _isSending = false;
      console.log(`Failed to submit contact details to the server because: ${JSON.stringify(reason)}`);
    });
  }

  return {
    getEmail,
    setEmail,
    isValidEmail,
    getName,
    setName,
    hasInterest,
    setInterested,
    getMessage,
    setMessage,
    canSubmit,
    signupSuccessful,
    getSignupDetails,
    signup,
    isSending,
  }
})();

const interests = [
  'Eyesight Matters in Health',
  'Bates Method Fundamentals',
  'Somatic Seeing',
  'One to One Sessions',
]

const MAILING_LIST = 'Mailing list';

const contact_app = document.getElementById('contact_app');
const introduction = contact_app.textContent;

const signupComponent = (function() {
  function viewSignupSuccess(name) {
    return m('.contact-signup-success', ["Thank you ", m('em', name), ", your message has been sent to Anna."]);
  }
  
  function viewSignupFailure(name) {
    return m('.contact-signup-fail', ["Sorry ", m('em', name), ", a problem was encountered and your message has not been sent to Anna."]);
  }
  
  function view() {
    if (contactModel.signupSuccessful()) {
      const signupDetails = contactModel.getSignupDetails();
      if (signupDetails) {
        return viewSignupSuccess(signupDetails.name);
      }
    } else {
      return viewSignupFailure(contactModel.getName());
    }
  }
  
  return {
    view,
  }
})();

const emailComponent = (function () {
  function view() {
    if (contactModel.getEmail() == '' || contactModel.isValidEmail()) {
      return m('.form-group', [
        m('label', {for: '#contact_email'}, 'Email (required)'),
        m('input.form-control#contact_email[type="email"]', {
          oninput: e => contactModel.setEmail(e.target.value),
          value: contactModel.getEmail(),
        }),
      ]);
    } else {
      return m('.form-group', [
        m('label', {for: '#contact_email'}, [
          'Email (required)',
          m('span.validation-error', "invalid")
        ]),
        m('input.form-control.invalid-input#contact_email[type="email"]', {
          oninput: e => contactModel.setEmail(e.target.value),
          value: contactModel.getEmail(),
        }),
      ]);
    }
  }

  return {
    view,
  }
})();


const sendButtonComponent = (function () {
  function view() {
    if (contactModel.isSending()) {
      return m('.wait-spinner');
    } else {
      return m('.text-center', [
        m('button.btn .btn-primary .btn-xl', {
          disabled: !contactModel.canSubmit(),
          onclick: contactModel.signup
        }, 'Send'),
      ]);
    }
  }

  return {
    view,
  }
})();


m.mount(contact_app, {
  view: function() {
    return m('div', [
      m('p', introduction),
      m('fieldset.col-md-8 col-md-offset-2', [
        m('.form-group', [
          m('label', {for: '#contact_name'}, 'Name (required)'),
          m('input.form-control#contact_name[type="text"]', {
            oninput: e => contactModel.setName(e.target.value),
            value: contactModel.getName(),
          }),
        ]),
        m(emailComponent),
        m('.form-group', [
          m('p', "If you would like to attend a course can you please write a little about what you do and why you would like to attend this course?"),
          m('label', {for: 'contact_message'}, 'Message'),
          m('textarea.form-control#contact_message', {
            oninput: e => contactModel.setMessage(e.target.value),
            value: contactModel.getMessage(),
          }),
        ]),
        m('.form-group .invisible', [
          m('label', [
            'I am interested in:',
            interests.map((interest) => {
              return m('.checkbox', [
                m('label', [
                  m('input[type="checkbox"]', {
                    checked: contactModel.hasInterest(interest),
                    oninput: e => contactModel.setInterested(interest, e.target.checked),
                  }),
                  interest,
                ]),
              ]);
            })
          ]),
        ]),
        m('.form-group', [
          m('p', "Tick the following box if you'd like to be on my mailing list too. I'll let you know first about new workshops coming up and I'll never share your address with anyone. I send out emails about every couple of months so it won't be heavy on your inbox either."),
          m('label', [
            'Mailing List',
            m('.checkbox', [
              m('label', [
                m('input[type="checkbox"]', {
                  checked: contactModel.hasInterest(MAILING_LIST),
                  oninput: e => contactModel.setInterested(MAILING_LIST, e.target.checked),
                }),
                'I would like to be on your mailing list',
              ]),
            ]),
          ]),
        ]),
        m(sendButtonComponent),
        m(signupComponent),
      ])
    ]);
  }
});

let infoButtons = document.getElementsByClassName('info-button');
for (let infoButton of infoButtons) {
  let interest = infoButton.id;
  let buttonText = infoButton.innerHTML;
  m.mount(infoButton, {
    view: function() {
      return m('a.btn .btn-primary .btn-xl .page-scroll', {
        href: '#contact',
        onclick: () => contactModel.setInterested(interest, true),
      }, buttonText);
    }
  });
}
