document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = () => {
    const to = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: to.value,
          subject: subject.value,
          body: body.value
      })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    load_mailbox('inbox');
    return false;
  }
  load_mailbox('inbox')
})

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) { 
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show the relevant emails
  console.log('Fetching Emails..')


  const emailTable = document.createElement("table");
  emailTable.id = "email-table"
  emailTable.setAttribute("class", "table table-bordered")
  document.querySelector('#emails-view').appendChild(emailTable)
  const emailTableHeader = document.createElement("thead")
  console.log(mailbox)
  if (mailbox == "sent") {
    var headings = ["To", "Body", "Timestamp"];
  } else {
    var headings = ["From", "Body", "Timestamp"];
  }
  
  headings.forEach(heading => {
    const cell = document.createElement("th")
    cell.innerHTML = heading
    emailTableHeader.appendChild(cell)
  })
  document.querySelector('#email-table').appendChild(emailTableHeader)

  fetch(`/emails/${mailbox}`)  
  .then(response => response.json())
  .then(emails => {
    //console.log(emails);

    emails.forEach(email => {
      const row = document.createElement("tr")
      const rowEmail = document.createElement("td")
      const rowSubject = document.createElement("td")
      const rowTime = document.createElement("td")
      rowEmail.innerHTML = email.sender
      rowSubject.innerHTML = email.subject
      rowTime.innerHTML = email.timestamp
      row.appendChild(rowEmail)
      row.appendChild(rowSubject)
      row.appendChild(rowTime)
      console.log(email.read)
      if (!email.read) {
        row.setAttribute("class", "table-secondary")
        //row.style.backgroundColor = "gray"
      } else {
        //row.setAttribute("class", "table-light")
      }
      document.querySelector('#email-table').appendChild(row);
    });
    })

  // Handle error with API request
  //.catch(error => {
  //    alert('Error:', error)
  //})
}

