---
# for Jekyll parsing
---

const contactModel = (function() {
  let _email = '';
  let _name = '';
  let _interests = new Set();

  let setEmail = (email) => { _email = email };

  let getEmail = () => _email;

  let setName = (name) => { _name = name };

  let getName = () => _name;

  let hasInterest = (interest) => _interests.has(interest);

  let setInterested = (interest, interested) => { (interested) ? _interests.add(interest) : _interests.delete(interest) }

  let canSubmit = () => _email !== '' && _interests.size > 0;

  async function signup() {
    try {
      let payload = {"email": _email, "name": _name, "interests": Array.from(_interests)};
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
    canSubmit,
    signup,
  }
})();

const interests = [
  'Eyesight Matters in Health',
  'Bates Method Fundamentals',
  'Tailored individual sessions',
  'Somatic Seeing',
]

const MAILING_LIST = 'Mailing list';

const contact_app = {
  view: function() {
    return m('.col-sm-6 .p-b-sm-50', [
      m('p', 'If you would like more information on my classes or you would like to receive email updates on future classes and workshops please fill in the contact form below.'),
      m('fieldset', [
        m('.form-group', [
          m('label', {for: '#contact-name'}, 'Name'),
          m('input.form-control#contact_name[type="text"][placeholder="Your name"]', {
            oninput: e => contactModel.setName(e.target.value)
          }),
        ]),
        m('.form-group', [
          m('label', {for: ''}, 'Email'),
          m('input.form-control#contact_email[type="email"][placeholder="Email"]', {
            oninput: e => contactModel.setEmail(e.target.value)
          }),
        ]),
        m('.form-group', [
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
          }, 'Contact Me'),
        ]),
      ])
    ]);
  }
}

m.mount(document.getElementById('contact_app'), contact_app);

let infoButtons = document.getElementsByClassName('info-button');
for (let infoButton of infoButtons) {
  m.mount(infoButton, {
    view: function() {
      let interest = infoButton.id;
      return m('a.btn .btn-primary .btn-xl .page-scroll',{
        href: '#contact',
        onclick: () => contactModel.setInterested(interest, true),
      }, 'More Information');
    }
  });
}
