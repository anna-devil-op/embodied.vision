
---
# for Jekyll parsing
---

(function () {
  const contactApp = document.getElementById('contact_app')
  if (!contactApp) {
    return
  }

  const contactModel = (function () {
    let _email = ''
    let _isValidEmail = false
    let _name = ''
    let _message = ''
    const _interests = new Set()
    let _addToMailingList = false
    let _signupDetails = null
    let _signupError = false
    let _isSending = false

    const _clear = () => {
      _email = ''
      _isValidEmail = false
      _name = ''
      _message = ''
      _interests.clear()
      _addToMailingList = false
    }

    const setEmail = (email) => {
      _email = email
      _isValidEmail = (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(_email))
    }

    const isValidEmail = () => _isValidEmail

    const getEmail = () => _email

    const setName = (name) => { _name = name }

    const getName = () => _name

    const hasInterest = (interest) => _interests.has(interest)

    const setInterested = (interest, interested) => { (interested) ? _interests.add(interest) : _interests.delete(interest) }

    const setAddToMailingList = (add) => { _addToMailingList = add }

    const isAddToMailingList = () => _addToMailingList

    const setMessage = (message) => { _message = message }

    const getMessage = () => _message

    const canSubmit = () => _email !== '' && _isValidEmail && _name !== ''

    const signupSuccessful = () => !_signupError

    const getSignupDetails = () => _signupDetails

    const isSending = () => _isSending

    const getPayload = () => {
      return {
        email: _email,
        name: _name,
        message: _message,
        interests: Array.from(_interests),
        addToMailingList: _addToMailingList
      }
    }

    async function signup () {
      _isSending = true
      _signupDetails = null
      _signupError = false
      const payload = getPayload()
      m.request({
        method: 'POST',
        url: '{{ site.contacts_url }}',
        body: payload
      }).then(value => {
        _signupDetails = payload
        _isSending = false
        _clear()
      }, reason => {
        _signupError = true
        _isSending = false
        console.log(`Failed to submit contact details to the server because: ${JSON.stringify(reason)}`)
      })
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
      setAddToMailingList,
      isAddToMailingList,
      canSubmit,
      signupSuccessful,
      getSignupDetails,
      signup,
      isSending
    }
  })()

  const interests = [
    'Eyesight Matters in Health',
    'Bates Method Fundamentals',
    'Somatic Seeing',
    'One to One Sessions'
  ]

  const introduction = contactApp.textContent

  const signupComponent = (function () {
    function viewSignupSuccess (name) {
      return m('.contact-signup-success', ['Thank you ', m('em', name), ', your message has been sent to Anna.'])
    }

    function viewSignupFailure (name) {
      return m('.contact-signup-fail', ['Sorry ', m('em', name), ', a problem was encountered and your message has not been sent to Anna.'])
    }

    function view () {
      if (contactModel.signupSuccessful()) {
        const signupDetails = contactModel.getSignupDetails()
        if (signupDetails) {
          return viewSignupSuccess(signupDetails.name)
        }
      } else {
        return viewSignupFailure(contactModel.getName())
      }
    }

    return {
      view
    }
  })()

  const emailComponent = (function () {
    function view () {
      if (contactModel.getEmail() === '' || contactModel.isValidEmail()) {
        return m('.form-group', [
          m('label', { for: '#contact_email' }, 'Email (required)'),
          m('input.form-control#contact_email[type="email"]', {
            oninput: e => contactModel.setEmail(e.target.value),
            value: contactModel.getEmail()
          })
        ])
      } else {
        return m('.form-group', [
          m('label', { for: '#contact_email' }, [
            'Email (required)',
            m('span.validation-error', 'invalid')
          ]),
          m('input.form-control.invalid-input#contact_email[type="email"]', {
            oninput: e => contactModel.setEmail(e.target.value),
            value: contactModel.getEmail()
          })
        ])
      }
    }

    return {
      view
    }
  })()

  const sendButtonComponent = (function () {
    function view () {
      if (contactModel.isSending()) {
        return m('.wait-spinner')
      } else {
        return m('.text-center', [
          m('button.btn .btn-primary .btn-xl', {
            disabled: !contactModel.canSubmit(),
            onclick: contactModel.signup
          }, 'Send')
        ])
      }
    }

    return {
      view
    }
  })()

  m.mount(contactApp, {
    view: function () {
      return m('div', [
        m('p', introduction),
        m('fieldset.col-lg-8 offset-lg-2', [
          m('.form-group', [
            m('label', { for: '#contact_name' }, 'Name (required)'),
            m('input.form-control#contact_name[type="text"]', {
              oninput: e => contactModel.setName(e.target.value),
              value: contactModel.getName()
            })
          ]),
          m(emailComponent),
          m('.form-group', [
            m('p', 'If you would like to attend a course can you please write a little about what you do and why you would like to attend this course?'),
            m('label', { for: 'contact_message' }, 'Message'),
            m('textarea.form-control#contact_message', {
              oninput: e => contactModel.setMessage(e.target.value),
              value: contactModel.getMessage()
            })
          ]),
          m('.form-group .invisible', [
            m('label', [
              'I am interested in:',
              interests.map((interest) => {
                return m('.checkbox', [
                  m('label', [
                    m('input[type="checkbox"]', {
                      checked: contactModel.hasInterest(interest),
                      oninput: e => contactModel.setInterested(interest, e.target.checked)
                    }),
                    interest
                  ])
                ])
              })
            ])
          ]),
          m('.form-group', [
            m('p', "Tick the following box if you'd like to be on my mailing list too. I'll let you know first about new workshops coming up and I'll never share your address with anyone. I send out emails about every couple of months so it won't be heavy on your inbox either."),
            m('label', [
              'Mailing List',
              m('.checkbox', [
                m('label', [
                  m('input[type="checkbox"]', {
                    checked: contactModel.isAddToMailingList(),
                    oninput: e => contactModel.setAddToMailingList(e.target.checked)
                  }),
                  'I would like to be on your mailing list'
                ])
              ])
            ])
          ]),
          m(sendButtonComponent),
          m(signupComponent)
        ])
      ])
    }
  })

  const infoButtons = document.getElementsByClassName('info-button')
  for (const infoButton of infoButtons) {
    const interest = infoButton.id
    const buttonText = infoButton.innerHTML
    m.mount(infoButton, {
      view: function () {
        return m('a.btn .btn-primary .btn-xl .page-scroll', {
          href: '#contact',
          onclick: () => contactModel.setInterested(interest, true)
        }, buttonText)
      }
    })
  }
})();

(function () {
  $(window).on('scroll', function (event) {
    const scrollValue = $(window).scrollTop()
    if (scrollValue > 100) {
      $('.fixed-top').addClass('affix')
    } else {
      $('.fixed-top').removeClass('affix')
    }
  })

  $(document).ready(function () {
    $('.navbar-collapse a').click(function () {
      $('.navbar-collapse').collapse('hide')
    })
  })

  if ('WOW' in window) {
    new WOW().init()
  }
})()
