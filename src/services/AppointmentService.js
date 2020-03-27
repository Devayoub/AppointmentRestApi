/**
 * Appointment service
 */

const _ = require('lodash')
const config = require('config')

const bcrypt = require('bcryptjs')
const errors = require('http-errors')
const joi = require('joi')
const Nylas = require('nylas');

const { User,Appointment } = require('../models')
const helper = require('../common/helper')

Nylas.config({
  clientId: config.nylas.CLIENT_ID,
  clientSecret: config.nylas.CLIENT_SECRET,
});
const nylas = Nylas.with(config.nylas.TOKEN);





/**
 * AvailableSchedule
 * @param {String} ProviderId ProviderId
 * @returns {Object} Free and busy times
 */
const AvailableSchedule = async (ProviderId,day) => {
 var start = new Date(day)
 var end = new Date(day)
 start.setHours(09,00)
 end.setHours(09,30)
 var busy = []
 var timeslots = []
 timeslots.push([start,end])
 var free = []


 // Set default time slots
 for(i=1;i<=16;i++){
   let time = []
   start = new Date(end.getTime())
   end = new Date(start.getTime() + 30 * 60000)
   time.push(start)
   time.push(end)
   timeslots.push(time)

   
  
 }

 const provider = await helper.ensureExists(User,ProviderId)
 if(!provider.calendarId) throw new errors.BadRequest("Provider must have a calendar")
 const calendarId = provider.calendarId
 starts_after=new Date(day).setHours(09,00)/1000
 starts_before=new Date(day).setHours(18,00)/1000


  events = await nylas.events.list({calendar_id:calendarId,starts_after,starts_before})
  
    _.each(events,(event)=>{
      if(event.busy){
     
        busy.push([new Date(event.when.start_time*1000),new Date(event.when.end_time*1000)])
        
      }
    })
   let free1 = timeslots.filter((x)=>{
     let bool = false
        busy.forEach((e) => {
           if((Number(x[0])-Number(e[0]) !== 0) && (Number(x[1])-Number(e[1]) !== 0))
           {
             bool = true
             return
           }

        });
        return bool
        
   } )
  
   return {busy,free1}
  


}

AvailableSchedule.schema = {

  ProviderId: joi.string(),
  day:joi.string()
}

/**
 * Make Appointments
 * @param {Object} data Data to create Staff
 * @returns {Object} Created Staff
 */
const MakeAppointments = async (clientId,providerId,data) => { 

  const provider = await  helper.ensureExists(User,providerId)
  if(!provider.calendarId) throw new errors.BadRequest('provider has no calendar ')
  const client =await  helper.ensureExists(User,clientId)
  if(!client.calendarId) throw new errors.BadRequest('User has no calendar ')
 
  start_time = new Date(data.time)
  end_time = new Date(start_time)
  end_time.setMinutes(end_time.getMinutes()+30);

  
const event_provider = nylas.events.build({
  title: data.title,
  calendarId:provider.calendarId,
  // Event times are set via UTC timestamps
  when: { start_time, end_time },
  // Participants are stored as an array of participant subobjects
  participants: [{ email: client.email, name:  client.name }],
  busy : true
});
event_provider.busy = true;
event_provider.save()
  .catch(
    (err)=>{throw new errors.BadRequest(err)}
  )
  const event_client = nylas.events.build({
    title: data.title,
    calendarId:provider.calendarId,
    // Event times are set via UTC timestamps
    when: { start_time, end_time },
    // Participants are stored as an array of participant subobjects
    participants: [{ email: provider.email, name:  provider.name }],
  
  });
  event_client.busy = true;
  event_client.save()
  .catch(
    (err)=>{throw new errors.BadRequest(err)}
    )
 return Appointment.create({clientId,providerId,event_client_id:event_client.id,event_provider_id:event_provider.id})
}

MakeAppointments.schema = {
  clientId: joi.string().required(),
  providerId: joi.string().required(),
  data: joi.object({
      title:joi.string().required(),
      time:joi.date().required()
  })
}

/**
 * update Appointment
 * @param {String} patientId patientId
 * @param {String} providerId
 * @returns {Object} result
 */
const updateAppointment = async (currentUserId,eventId,data,type) => {
  const currentUser = await helper.ensureExists(User,currentUserId)
  const calendarId = currentUser.calendarId
  let appointment
  
  try{
    events = await  nylas.events.list()

  }
  catch(err){
     throw new errors.InternalServerError(err)
    }
   const event = events.filter((ev)=> ev.id == eventId)[0]
   
   if(!event){
      throw new errors.NotFound('event not found')
    }
  
  if(calendarId !== event.calendarId) throw new errors.Unauthorized('Action not authorized')
  if(currentUser.role === 'Provider'){
   //  appointment =await helper.ensureExists(Appointment,{event_provider_id:eventId})

  }
  else
  {
   // appointment =await helper.ensureExists(Appointment,{event_client_id:eventId})

  }
  if(type === 'update'){

      event.title = data.title||event.title
      event.description = data.description||event.description
      event.when= data.when || event.when

  }
  if(type === 'cancel'){
    event.status = 'cancelled'
   
  }
  if(type === 'complete'){
    if(currentUser.role !== 'Provider') throw new errors.Unauthorized('Action not authorized')

      event.title ='DONE_'.concat(event.title)
     
      return event
  }
  return event
}

updateAppointment.schema = {
  currentUserId: joi.string().required(),
  eventId: joi.string().required(),
  data: joi.object({
   title: joi.string(),
    description: joi.string(),
    when: joi.object({
      start_time :joi.date(),
      end_time:joi.date()
    })
  }),
  type:joi.string().required(),
}



/**
 *  Appointment List (Upcoming/Past Appointments)
 * @param {String} Id (physician or patient) 
 * @param {String} type (Upcoming Or Past) 
 * @returns {Object} Appointment list
 */
const AppointmentList = async (id,type) => {
  const user =await  helper.ensureExists(User,id)
  calendar_id = user.calendarId
    let list

  await nylas.events.list({calendar_id}).then(events => {
    if(type==='past'){
     
      list = events.filter((ev)=> new Date(ev.start*1000)-Date.now()>0)

    }
    else {
      list = events.filter((ev)=> new Date(ev.start*1000)-Date.now()<=0)
    }

    for (let event of events) {
  
      
        
       
    }
  })
  .catch((err)=>{ throw new errors.BadRequest(err)}
  
  )

  return list
}

AppointmentList.schema = {
  id: joi.id().required(),
  type:joi.string()
}
/**
 * retrieve calendar list 
 * @returns {Object} calendar list
 */
const getCalendarList = async () => {
  

// Get all calendars found in the user's account
const list = []
 await nylas.calendars.list().then((calendars) =>{
  
_.each(calendars,(c)=>{

   list.push({id:c.id,name:c.name})
})

 } );
return list
}



/**
 * Set default calendar
 * @returns {String} Message Status
 */
const setDefaultCalendar = async (userId,calendarId) => {

  const user =await  helper.ensureExists(User,userId)
  return user.update({
    calendarId: calendarId
  })

}
setDefaultCalendar.schema = {
  userId: joi.id().required(),
  calendarId: joi.id().required(),
}
module.exports = {
  MakeAppointments,
  updateAppointment,
  AppointmentList,
  getCalendarList,
  setDefaultCalendar,
  AvailableSchedule
}
