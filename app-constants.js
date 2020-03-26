/**
 * App constants
 */
const UserRoles = {
  Physician: 'Physician',
  Patient: 'Patient'
}

const VerificationCodeTypes = {
  SignUp: 'signUp',
  ForgotPassword: 'forgotPassword'
}

const BooleanStrings = {
  True: 'true',
  False: 'false'
}

const ProviderFields = ['firstName', 'lastName', 'roles', 'address', 'providerInfo', 'createdAt', 'updatedAt']

const NylasAuthScopes = {
  Calendar: 'calendar'
}

const AppointmentTypes = {
  Ongoing: 'ongoing',
  Upcoming: 'upcoming',
  Past: 'past'
}

const CalendarEventFields = ['title', 'description', 'owner', 'participants', 'status']

const AppointmentFields = ['id', 'providerId', 'patientId', 'meetingId', 'meetingPassword']

const MinToSecondsConversionFactor = 60

module.exports = {
  UserRoles,
  VerificationCodeTypes,
  BooleanStrings,
  ProviderFields,
  NylasAuthScopes,
  AppointmentTypes,
  CalendarEventFields,
  AppointmentFields,
  MinToSecondsConversionFactor
}
