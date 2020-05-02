import {
    LOGIN_VTOP_REQUEST,
    LOGIN_VTOP_SUCCESS,
    LOGIN_VTOP_ERROR,
    
    FETCH_ATTENDANCE_REQUEST,
    FETCH_ATTENDANCE_SUCCESS,
    FETCH_ATTENDANCE_ERROR,

    FETCH_TIMETABLE_REQUEST,
    FETCH_TIMETABLE_SUCCESS,
    FETCH_TIMETABLE_ERROR,

    REFORMAT_DATA
    } from '../actions/types'
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunkMiddleware from 'redux-thunk'
import logger from "redux-logger";

const initialState = {
    userInfo : {},
    status: '',
    error : '',
    timetable : {}
}

const splitSlots = (slot)=>{
    return slot.split("+")
}

const toggleCase = (str)=>{
    // This function is copied from https://stackoverflow.com/a/32589289
    // Thank you @somethinghere. I could've wrote this myself but im lazy
    let splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
}

const formatData = (state)=>{
    attendance = state.attendance
    timetable = state.timetable

    let slots = attendance.Slots
    slots = slots.map(splitSlots)
    let coursesInfo = []


    for(let i=0;i<attendance.Attended.length;++i){
        coursesInfo.push({
            ...attendance.Attended[i],
            slot: slots[i],
            faculty: toggleCase(attendance.Attended[i].faculty),
            days: []
        })
    }
    let newTimetable = {

    }

    for(day in timetable.Timetable){
        newTimetable[day] = []
        for(classes of timetable.Timetable[day]){
            const index = coursesInfo.findIndex(element => element['slot'].includes(classes['slot']))
            coursesInfo[index] = {
                ...coursesInfo[index],
                class: classes['class'],
                days: coursesInfo[index]['days'].concat(day)
            }
            const newClass = {
                slot : classes.slot,
                startTime : classes.startTime,
                endTime : classes.endTime
            }
            newTimetable[day].push(newClass)
        }
    }
    // console.log(newTimetable)
    let finalTimetable = {

    }
    for(day in newTimetable){
        finalTimetable[day] = []
        for(let i=0;i<newTimetable[day].length;++i){
            if (newTimetable[day][i]['slot'][0] !== "L"){
                finalTimetable[day].push(newTimetable[day][i])
            }
            else{
                finalTimetable[day].push({
                    slot: `${newTimetable[day][i]['slot']}+${newTimetable[day][i+1]['slot']}`,
                    startTime: newTimetable[day][i]['startTime'],
                    endTime:newTimetable[day][i+1]['endTime']
                })
                i=i+1
            }
        }
    }
    return {
        timetable : finalTimetable,
        coursesInfo : coursesInfo
    }
}


const reducer = (state = initialState, action)=>{
    switch(action.type){
        case LOGIN_VTOP_REQUEST:
            return {
                ...state,
                status:"REQUEST_VTOP",
                error: ""
            }
        case LOGIN_VTOP_SUCCESS:
            return {
                ... state, 
                status:"VTOP_COMPLETE",
                userInfo : action.data
            }
        case LOGIN_VTOP_ERROR:
            return {
                ... state,
                status : "ERROR",
                error : action.error
            }
        
        // For attendance

        case FETCH_ATTENDANCE_REQUEST:
            return {
                ...state,
                status:"REQUEST_ATTENDANCE",
                error: ""
            }
        case FETCH_ATTENDANCE_SUCCESS:
            return {
                ...state,
                status:"ATTENDANCE_COMPLETE",
                attendance: action.data
            }
        case FETCH_ATTENDANCE_ERROR:
            return {
                ...state,
                status:"ERROR",
                error: action.error
            }
        // For timetable

        case FETCH_TIMETABLE_REQUEST:
            return {
                ...state,
                status : "REQUEST_TIMETABLE",
                error:""
            }
        case FETCH_TIMETABLE_SUCCESS:
            return {
                ...state,
                status : "TIMETABLE_COMPLETE",
                timetable:action.data
            }
        case FETCH_TIMETABLE_ERROR:
            return {
                ...state,
                status: "ERROR",
                error : action.error
            }

        case REFORMAT_DATA:
            // This will be called only once and reformate the api
            const {timetable, coursesInfo } = formatData(state)
            return {
                ...state,
                timetable,
                coursesInfo,
                status : "FORMAT_COMPLETE"
            }
        default :
            return state
    }
}


const rootReducer = combineReducers({
    reducer
})

export default function configureStore(preloadedState){
    return createStore(
        rootReducer,
        preloadedState,
        applyMiddleware(thunkMiddleware, logger)
    )
}