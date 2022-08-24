const meetDateRoute = require('express').Router()
// const { useResolvedPath } = require('react-router-dom');
// const { formatWithOptions } = require('util');
const MeetDateModel = require('../models/MeetDateModel');
const UserModel = require('../models/UserModel');
const AvailbilityModel = require('../models/AvailabilityObjectModel');
const mailer = require('../utils/mailer');

// POST route that creates a meeting date
meetDateRoute.route('/add').post(function (req, res) {
  let meetDateModel = new MeetDateModel(req.body);
  meetDateModel.save()
    .then(dateSaved => {
        for (let i=0; i<dateSaved.emails.length; i++) {
            // console.log(req.body.emails[i]);
            // console.log(meetDateModel.meetingNumber)
            mailer.sendMail(dateSaved.emails[i], dateSaved.meetingNumber);
        }
        
        return res.status(200).json({'dateSaved': 'Date in added successfully'});
    })
    .catch(err => {
        return res.status(400).send("unable to save to database");
    });
});

// GET route that gets the meeting object which is found through the :meetingNum parameter
meetDateRoute.route("/availability/:meetingNumber").get(async function (req, res) {
    const meetingNumber = req.params.meetingNumber;
    const data = await MeetDateModel.find({ meetingNumber: meetingNumber }).lean()
    return res.send(data)
})

// POST route that creates a user object when they add their name and availability & updates the meeting object with the user object
meetDateRoute.route("/availability/:meetingNumber").post(async function (req, res){
    const meetingNumber = req.params.meetingNumber
    let user = new UserModel(req.body)
    let userName = user["userName"]
    
    
    for (let i = 0; i < user.availability.length ; i++) {
        
        let availability = user["availability"][i]
        let availID = user["availability"][i]["id"]
        let availabilityObject = new AvailbilityModel({userName: userName, availability: availability})

        if (availID === 0  ) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.sunday": availabilityObject}})
        } else if (availID === 1) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.monday": availabilityObject}})
        } else if (availID === 2) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.tuesday": availabilityObject}})
        } else if (availID === 3) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.wednesday": availabilityObject}})
        } else if (availID === 4) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.thursday": availabilityObject}})
        } else if (availID === 5) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.friday": availabilityObject}})
        } else if (availID === 6) {
            await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, {$push: {"availabilityArray.saturday": availabilityObject}})
        } 
        availabilityObject.save()
    }
    await MeetDateModel.updateOne({ meetingNumber: meetingNumber }, { $push: { users: user } })
    user.save()
      .then(userSaved => {
        return res.status(200).json({'userSaved': 'User in added successfully'});
          
      })
      .catch(err => {
          return res.status(400).send("unable to save to database");
      })
})

// GET route that gets the meeting object which is found through the :meetingNum parameter but then returns the users availability inside the users array of the meeting object
meetDateRoute.route("/results/:meetingNumber").get(async function (req, res) {
    const meetingNumber = req.params.meetingNumber;
    const data = await MeetDateModel.find({ meetingNumber: meetingNumber }).lean()

    return res.send(data)

})

meetDateRoute.route("/overlapping/:meetingNumber").get( async function (req, res) {
    const meetingNumber = req.params.meetingNumber;
    const data = await MeetDateModel.find({ meetingNumber: meetingNumber }).lean();
    const arrayOfUsers = data[0].users;
    // console.log(`l89 - arrayOfUsers is ${arrayOfUsers}`)
    let availabilityByDateArrays = [];
    
    // function to get date from time string, returns a time object 
    const getDate = (timestring) => {
      let dateObject = new Date(timestring);
      let year = dateObject.getFullYear();
      let month = dateObject.getMonth() + 1;
      let date = dateObject.getDate();
      let hours = dateObject.getHours();
      let minutes = dateObject.getMinutes();

      if (month < 10){
        month = `0${month}`;
      }

      if(date < 10){
        date = `0${date}`;
      }

      let dateString = `${year}-${month}-${date}`

      return {dateString: dateString, hours:hours, minutes: minutes}
    }


    // function that creates an array with 48 timeslots (30 min slots) for a specific date passed as parameter
    const createTimeSlots = (dateString) => {
      let amPmTime = "";
      let timeString = "";
      let timeArrayAmPm = [];

      for(let i = 0; i < 48; i++){
          let counter = 0;
          if ( i === 0 ){
              amPmTime = "12:00 am - 12:30 am";
              timeString = `${dateString}T00:00:00`;
          } else {
            if (i % 2 !== 0) {
                counter++;
            }

            if (i < 20){
              timeString = i % 2 === 0 ?`${dateString}T0${(i - counter)/2}:00:00` :`${dateString}T0${(i - counter)/2}:30:00`
            }else{
              timeString = i % 2 === 0 ?`${dateString}T${(i - counter)/2}:00:00` :`${dateString}T${(i - counter)/2}:30:00`
            }

            // console.log(`timeString is: ${timeString}`)
            if(i < 24){
              if (i === 1){
                amPmTime = "12:30 am - 1:00 am"
              }else if (i === 23){
                amPmTime = "11:30 am - 12:00 pm"
              }else{
                amPmTime =
                i % 2 === 0 ? `${(i - counter) / 2}:00 am - ${(i - counter) / 2}:30 am` : `${(i - counter) / 2}:30 am - ${((i - counter) / 2) + 1}:00 am`;
              }
            }else{
              if (i === 24){
                amPmTime = "12:00 pm - 12:30 pm";
              }else if ( i === 25){
                amPmTime = "12:30 pm - 1:00 pm"
              }else if( i === 47){
                amPmTime = "11:30 pm - 12:00 am"
              }else{
                amPmTime =
                i % 2 === 0 ? `${((i - counter) / 2) - 12}:00 pm - ${((i - counter) / 2) -12}:30 pm` : `${((i - counter) / 2) - 12}:30 pm - ${(((i - counter) / 2) + 1) -12}:00 pm`;
              }
            }
          }

          timeArrayAmPm.push({ time: amPmTime, timeString: timeString, array: [] });
      }
      return timeArrayAmPm;
    }

    // function that adds user's availability block to the day array
    const addUserToDayArray = (dayArray, startObj, endObj, userName) => {
   
    let start = 
      startObj.hours * 2 + 
      (startObj.minutes === 0 ?0 :1);
    let end =
      endObj.hours * 2 +
      (endObj.minutes === 0 ? 0 : 1);
    // add user to day results for the timeblock start and end
    for(let i=start; i < end; i++){
      dayArray[i].array.push({user: userName, start: start, end: end, startObj: startObj, endObj: endObj})
    }

    return dayArray;
    }

  
  
    // function to add user's availability timeblocks
    const fillTimeSlots = ({availabilityArray, userName}) => {

      // function for replacing objects in the availabilityByDateArrays
      const replaceExistingArray = (retrievedObject, startObj, endObj, userName, date, index) => {
        // console.log(`replaceExistingArray function called`)
        const updatedArray = addUserToDayArray(retrievedObject, startObj, endObj, userName);
        const updatedObject = {date: date, availabilityByDateArray: updatedArray}

        // replace the array using the index of the retrievedObject
        availabilityByDateArrays.splice(index, 1, updatedObject);
      }

      // function for creating a new object and adding availability
      const createNewArray = (date, startObj, endObj, userName) => {
        // console.log(`createNewArray function called`)
        const newDayArray = createTimeSlots(date);
        const updatedDayArray = addUserToDayArray(newDayArray, startObj, endObj, userName);
        const updatedDayObject = {date: date, availabilityByDateArray: updatedDayArray};
        availabilityByDateArrays.push(updatedDayObject);
      }

      if(availabilityArray.length > 0){
          // iterate through user's availability 
          availabilityArray.forEach((availObj) => {
            
              const startObj = getDate(availObj.start);
              const startDate = startObj.dateString;
              const endObj = getDate(availObj.end);
              const endDate = endObj.dateString;

              // availabilityByDateArrays is an array of objects, object has date and availabilityByDateArray keys
              if (availabilityByDateArrays.length > 0){
                // availabilityByDateArrays contains objects 
                // if it contains an object with the start date, find the object
                const retrievedStartObject = availabilityByDateArrays.find(({date}) => date === startDate);
                const indexOfRetrievedStartObject = availabilityByDateArrays.findIndex(object => object.date === startDate);
              
                // check for object with end date
                const retrievedEndObject = availabilityByDateArrays.find(({date}) => date === endDate);
                const indexOfRetrievedEndObject = availabilityByDateArrays.findIndex(object => object.date === endDate);

                if (indexOfRetrievedStartObject !== -1 && startDate === endDate){
                  // there is an object with a matching start and end date
                  // console.log("there is an object with a matching start and end date")
                  // add this availability to the array
                  
                  replaceExistingArray(retrievedStartObject.availabilityByDateArray, startObj, endObj, userName, startDate, indexOfRetrievedStartObject);
                }else if (startDate === endDate) {
                  // start and end match but there is not an object with that date
                  // console.log("start and end date match but there is not an object with that date")
                  // create new one
                  createNewArray(startDate, startObj, endObj, userName);

                }else if(indexOfRetrievedStartObject !== -1 && indexOfRetrievedEndObject !== -1){
                  // there is an object that matches the start date and an object that matches the end date
                  // console.log(" is an object that matches the start date and an object that matches the end date")
                  // add availability to the start date array at the start time and use end time of 24:00
                  replaceExistingArray(retrievedStartObject.availabilityByDateArray, startObj, {hours:24, minutes:0}, userName, startDate, indexOfRetrievedStartObject);

                  // and add availability on end date array starting at 0:00 and ending at end time
                  replaceExistingArray(retrievedEndObject.availabilityByDateArray, {hours:0, minutes:0}, endObj, userName, endDate, indexOfRetrievedEndObject);

                }else if(indexOfRetrievedStartObject !== -1) {
                  // there is an object for start date but not end date
                  // console.log("there is an object for start date but not end date")
                  // add availability to the start date array at the start time and use end time of 24:00
                  replaceExistingArray(retrievedStartObject.availabilityByDateArray, startObj, {hours:24, minutes:0}, userName, startDate, indexOfRetrievedStartObject);

                  // there is not an array for the date, need to create a new one
                  createNewArray(endDate, {hours:0, minutes:0}, endObj, userName);

                }else if (indexOfRetrievedEndObject !== -1){
                  // there is an object for the end date but not the start date
                  // console.log("there is an object for the end date but not the start date")
                  // and add availability on end date array starting at 0:00 and ending at end time
                  replaceExistingArray(retrievedEndObject.availabilityByDateArray, {hours:0, minutes:0}, endObj, userName, endDate, indexOfRetrievedEndObject);

                  // create new one for start date with end time of 24:00
                  createNewArray(startDate, startObj, {hours:24, minutes:0}, userName);
                }else{
                  // there are no objects for the start or end date
                  // console.log("there are no objects for the start or end date")
                  // create new one for start date with end time of 24:00
                  createNewArray(startDate, startObj, {hours:24, minutes:0}, userName);
                  // create new one with start time of 0:00
                  createNewArray(endDate, {hours:0, minutes:0}, endObj, userName);
                }
              }else{
                // the availabilityByDateArrays is empty
                // console.log("the availabilityByDateArrays is empty")
                if(startDate === endDate){
                  // create new one
                  createNewArray(startDate, startObj, endObj, userName);
                }else{
                  // create new one for start date with end time of 24:00
                  createNewArray(startDate, startObj, {hours:24, minutes:0}, userName);
                  // create new one with start time of 0:00
                  createNewArray(endDate, {hours:0, minutes:0}, endObj, userName);
                }
              }   
          })
          // console.log(`l285 - availabilityByDateArrays length is ${availabilityByDateArrays.length}`)
         
      }
      else{
        // console.log(`l287 - availabilityArray.length is not greater than 0`)
      }
    } // end of fillTimeSlots function

    // iterate through array of users
    // call fillTImeSlots function to add each user's availability to the availabilityByDateArrays
    try{
      arrayOfUsers.forEach( user => {
        const userName = user.userName;
        // console.log(`l294 - userName is ${userName}`)
        const availabilityArray = user.availability;
        // console.log(`l299 - availabilityArray.length is ${availabilityArray.length}`)
        fillTimeSlots({availabilityArray, userName});
      });

      
      if(availabilityByDateArrays !== undefined && availabilityByDateArrays.length > 0){
        
        //function to filter out timeslots that have a length > 0
        const filterDayArray = (dayArray) => {
          const timeslotsWithAvail = dayArray.filter(timeslot => {return timeslot.array.length > 0})
          
          return timeslotsWithAvail;
        }
        
        // iterate through the availabilityByDateArrays
        // return only timeSlots in each availability array that have a length > 0
        const filtredByDateAvailabilityArrays = availabilityByDateArrays.map((availArray) => {
          const filteredArraysWithResults = filterDayArray(availArray.availabilityByDateArray);
          const date = availArray.date;
          return {date:date, availabilityByDateArray:filteredArraysWithResults}
        })

        // sort the filtered results by date
        const sortedResults = filtredByDateAvailabilityArrays.sort((a,b) => {
          if(a.date < b.date){
            return -1;
          }
          if(a.date > b.date){
            return 1;
          }
        });
        // console.log(sortedResults)
        // return the array containing all of the availability objects
        return res.send(sortedResults);
      }
    }catch{
      console.log(`l309 - catch error while itterating through array of users `)
    }
  


  

        
})

module.exports = meetDateRoute;

