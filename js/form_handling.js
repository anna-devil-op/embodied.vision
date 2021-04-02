---
# for Jekyll parsing
---

const contactModel = (function() {
  let _email = '';
  let _name = '';
  let _message = '';
  let _interests = new Set();

  let setEmail = (email) => { _email = email };

  let getEmail = () => _email;

  let setName = (name) => { _name = name };

  let getName = () => _name;

  let hasInterest = (interest) => _interests.has(interest);

  let setInterested = (interest, interested) => { (interested) ? _interests.add(interest) : _interests.delete(interest) }

  let setMessage = (message) => { _message = message };

  let getMessage = () => _message;

  let canSubmit = () => _email !== '' && _name !== '';

  async function signup() {
    try {
      let payload = {"email": _email, "name": _name, "interests": Array.from(_interests), "message": _message};
      await m.request({
        method: "POST",
        url: "{{ site.contacts_url }}",
        body: payload,
      });
      console.log(`Signed up with ${JSON.stringify(payload)}`);
    } catch(error) {
      console.log(`Failed to sign up with email ${_email} because ${JSON.stringify(error)}`);
    }
  }

  return {
    getEmail,
    setEmail,
    getName,
    setName,
    hasInterest,
    setInterested,
    getMessage,
    setMessage,
    canSubmit,
    signup,
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

m.mount(contact_app, {
  view: function() {
    return m('div', [
      m('p', introduction),
      m('fieldset.col-md-8 col-md-offset-2', [
        m('.form-group', [
          m('label', {for: '#contact_name'}, 'Name (required)'),
          m('input.form-control#contact_name[type="text"][placeholder="Your name"]', {
            oninput: e => contactModel.setName(e.target.value)
          }),
        ]),
        m('.form-group', [
          m('label', {for: '#contact_email'}, 'Email (required)'),
          m('input.form-control#contact_email[type="email"][placeholder="Email"]', {
            oninput: e => contactModel.setEmail(e.target.value)
          }),
        ]),
        m('.form-group', [
          m('label', {for: 'contact_message'}, 'Message'),
          m('textarea.form-control#contact_message[placeholder="If you would like to attend a course can you please write a little about what you do and why you would like to attend this course?"]', {
            oninput: e => contactModel.setMessage(e.target.value)
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
        m('.text-center', [
          m('button.btn .btn-primary .btn-xl', {
            disabled: !contactModel.canSubmit(),
            onclick: contactModel.signup
          }, 'Send'),
        ]),
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
