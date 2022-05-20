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
        // for (let i=0; i<req.body.emails.length; i++) {
        //     console.log(req.body.emails[i]);
        //     console.log(meetDateModel.meetingNumber)
        //     mailer.sendMail(meetDateModel.meetingNumber);
        // }
        
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
    // console.log(data)
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
    const data = await MeetDateModel.find({ meetingNumber: meetingNumber }).lean()
    const importantArray = data[0].availabilityArray

    
    const createTimeSlots = (dayArray) => {
        // get date from dayArray if length > 0
        let dateString = "";
        let timeArrayAmPm = [];
        if(dayArray.length > 0){
          let startTime = dayArray[0].availability[0].start;
          const regEx = /(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/;
          const datesFromObj = regEx.exec(startTime);
          // console.log("------HERE------")
          // console.log(datesFromObj[0])
          // console.log("------HERE------")
          dateString = datesFromObj[0];
          // console.log("------HERE------")
          // console.log(dateString)
          // console.log("------HERE------")
        let amPmTime = "";
        let timeString = "";
        // console.log("------HERE------")
        // console.log(dateString)
        // console.log("------HERE------")
        for(let i = 0; i < 48; i++){
            let counter = 0;
            if ( i === 0 ){
                amPmTime = "12:00 am - 12:30 am";
                timeString = `${dateString}T00:00:00`;
            } else {
              if (i % 2 !== 0) {
                  counter++;
              }

              if (i < 9){
                timeString = i % 2 === 0 ?`${dateString}T0${(i - counter)/2}:00:00` :`${dateString}T0${(i - counter)/2}:30:00`
              }else{
                timeString = i % 2 === 0 ?`${dateString}T${(i - counter)/2}:00:00` :`${dateString}T${(i - counter)/2}:30:00`
              }
    
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
            // console.log(timeString)
            // console.log("------HERE------")
            // console.log(timeString)
            // console.log("------HERE------")
            timeArrayAmPm.push({ time: amPmTime, timeString: timeString, array: [] });
            }
        }

        
            return timeArrayAmPm;
    }

    let day0array = createTimeSlots(importantArray.sunday);
    let day1array = createTimeSlots(importantArray.monday);
    let day2array = createTimeSlots(importantArray.tuesday);
    let day3array = createTimeSlots(importantArray.wednesday);
    let day4array = createTimeSlots(importantArray.thursday);
    let day5array = createTimeSlots(importantArray.friday);
    let day6array = createTimeSlots(importantArray.saturday);

    const addUserToDayArray = (dayArray, event) => {
       
        // get start and end for each event as Date object
        // need to be turned into a date object
        let startObj = new Date(event.availability[0].start);
        let endObj = new Date(event.availability[0].end);
        let start = 
           startObj.getHours() * 2 + 
           (startObj.getMinutes() === 0 ?0 :1);
         let end =
           endObj.getHours() * 2 +
           (endObj.getMinutes() === 0 ? 0 : 1);
         // add user to day1results for the timeblock start and end
         for(let i=start; i < end; i++){
           dayArray[i].array.push({user: event.userName, start: start, end: end, startObj: startObj, endObj: endObj})
         }
        //  console.log(startObj)
        //  console.log(endObj)
         return dayArray;
      }

    if (importantArray.sunday.length > 0){
        importantArray.sunday.forEach(timeblock => {
            let sundayResults = addUserToDayArray(day0array, timeblock)
            // console.log(sundayResults)
    })
    }
    if (importantArray.monday.length > 0){
        importantArray.monday.forEach(timeblock => {
          let mondayResults = addUserToDayArray(day1array, timeblock)
        //   console.log(mondayResults)
        })
      }
    if (importantArray.tuesday.length > 0){
        importantArray.tuesday.forEach(timeblock => {
          let tuesdayResults = addUserToDayArray(day2array, timeblock)
        //   console.log(tuesdayResults)
        })
      }
    if (importantArray.wednesday.length > 0){
        importantArray.wednesday.forEach(timeblock => {
          let wednesdayResults = addUserToDayArray(day3array, timeblock)
        //   console.log(wednesdayResults)
        })
      }
    if (importantArray.thursday.length > 0){
        importantArray.thursday.forEach(timeblock => {
          let thursdayResults = addUserToDayArray(day4array, timeblock)
        //   console.log(thursdayResults)
        })
      }
    if (importantArray.friday.length > 0){
        importantArray.friday.forEach(timeblock => {
          let fridayResults = addUserToDayArray(day5array, timeblock)
        //   console.log(fridayResults)
        })
      }
    if (importantArray.saturday.length > 0){
        importantArray.saturday.forEach(timeblock => {
          let saturdayResults = addUserToDayArray(day6array, timeblock)
        //   console.log(saturdayResults)
        })
    }
    

        // create day arrays and push the time array into the day array
    return res.send({day0array, day1array, day2array, day3array, day4array, day5array, day6array});
        
})

module.exports = meetDateRoute;

