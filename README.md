# Appointement REST API

## Prerequisites

- NodeJS (v12)
- MongoDB (v4)
- SMTP server
- git

## Configuration

Configuration for the application is at `config/default.js` and `config/production.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level (To disable logging set LOG_LEVEL to a value different than 'debug')
- PORT: the server port
- API_PREFIX: the API path prefix
- MONGODB_URI: Mongo DB URI
- ACCESS_TOKEN_LIFETIME: The access token lifetime
- PASSWORD_HASH_SALT_LENGTH: the password hash salt length used to hash user password
- JWT_SECRET: the JWT secret
- NYLAS_APPLICATION_CLIENT_ID: The application id of Nylas application
- NYLAS_APPLICATION_CLIENT_SECRET: The client secret of Nylas application
- OGNOMY_CALENDAR_NAME: The name of the calendar to hold ognomy events.
- ENCRYPTION_SECRET_KEY: The encryption secret key
- MEETING_TITLE_TEMPLATE: The meeting title template
- MEETING_DESCRIPTION_TEMPLATE: The meeting description template
- WORK_DAY_MORNING_START: The morning start time of a typical work day
- WORK_DAY_MORNING_END: The morning end time of a typical work day
- WORK_DAY_EVENING_START: The evening start time of a typical work day
- WORK_DAY_EVENING_END: The evening end time of a typical work day
- TIME_SLOT_LENGTH_MINUTES: The length of a time slot in minutes
- TIME_SLOT_OUTPUT_TIME_FORMAT: The output format of time slot start/end time
- MONTH_DATE_INPUT_FORMAT: The format under which the input month when counting available time slots will be provided.
- NYLAS_BASE_URL: The Nylas base Url
- VERIFICATION_CODE_LIFETIME: The verification code lifetime.
- FROM_EMAIL: the default from email for sending emails
- EMAIL: the email config options
- VERIFICATION_CODE_EMAIL_SUBJECT: The verification code email subject
- VERIFICATION_CODE_EMAIL_BODY: The verification code email body template

# Database setup:
To setup the database, execute the following commands:
1. `cd db-docker`
2. `docker-compose up -d`
   
This will start MongoDB on docker.


# SMTP
You can use send grid SMTP API : https://sendgrid.com/docs/API_Reference/SMTP_API/integrating_with_the_smtp_api.html

# Nylas Account setup:
1. Go to www.nylas.com
2. Create an account
3. Go to https://dashboard.nylas.com/ and create a new application
   And note down the clientId and client secret, we will need them later
   Refer to https://docs.nylas.com/docs/get-your-developer-api-keys
4. Gmail accounts authentication need an extra step
   Follow https://docs.nylas.com/docs/creating-a-google-project-for-dev 
5. Go to https://dashboard.nylas.com/applications
   -- Edit your application
   -- In 'Callbacks' tab
   -- Enter http://localhost:3000/nylas/oauth/callback and click on 'Add Callback'
      This callback will handle saving the access token of the user into our database to be used for accessing Nylas API

# Test data updates:
**For testing you will need at least two gmail accounts, one for the provider and the other one for the patient**

1. Update `src/test-data.js` line #30 using a gmail account to which you have access (this will be the provider email)
2. In your browser, login to this gmail account to be used used as the provider email and create a calendar with the name that matches the configured calendar name in config.js#OGNOMY_CALENDAR_NAME configuration parameter (by default 'Ognomy-Meetings' is used as the calendar name)


## Installation/Deployment
- Make sure that the environment variables are properly set, for example:
```bash
export SMTP_HOST=smtp.sendgrid.net
export SMTP_PORT=587
export SMTP_USER=apikey
export SMTP_PASSWORD='SMTP_PASSWORD'
export ENCRYPTION_SECRET_KEY='jwg3O5XVpkj3xFSwLDTqwcz43eivCw6GbMig4K2siXI'

export NYLAS_APPLICATION_CLIENT_ID='Nylas application id retrieved above in step # Nylas Account setup: '
export NYLAS_APPLICATION_CLIENT_SECRET='Nylas application secret retrieved in step # Nylas Account setup:'
```

- Install dependencies `npm install`
- Clear and create collections `npm run clear-db`
- Insert test data `npm run test-data`

## Check code style
1. `npm run lint`
2. `npm run lint:fix`


## Starting the application

- Start app `npm start`
- App is running at `http://localhost:3000`


## Verification
1. Load postman collection collection and environment under docs folder
2. Update the environment : 
   Set physician_email using the gmail account used above( in test-data script)
   Set patient_email using a gmail account other than the one used above for the provider
3. Execute 'Send Verification Code - Patient' test
4. Connect to the gmail account used for patient and get the verification code
5. In 'Signup - Patient' test update the verification code value in the request body with the one retrieved above
6. Check the database, the user should be created and its data will be encrypted
7. Execute "Login - Patient"
8. Execute "Login - Physician"
9.  Execute "List All providers - By Patient"
10. execute "Get Nylas Authentication Url For Physician" to get the authentication url for physician
    Copy the result url and past it and press enter in your browser where you are logged in with gmail address used for the provider.
    Once this is done, the provider will be authenticated with Nylas:
    Navigate to https://dashboard.nylas.com/applications
    Select your Nylas application and click on 'Accounts'
    You will find the gmail account has been added to Accounts list
12. execute "Create Appointment By Patient"
    Go to google calendar for the provider, and you will see that the event has been created in the configured calendar 'Ognomy-Meetings'



