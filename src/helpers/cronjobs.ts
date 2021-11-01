import schedule from "node-schedule";

export const scheduleRequestJobChecker = (date, funcToRun) => {
    return new Promise((resolve, reject) => {
        schedule.scheduleJob(date, (fireDate) => {
            console.log("this job ran at ", fireDate, " , current date is: ", new Date())
            resolve(funcToRun())
        })
    })
}
