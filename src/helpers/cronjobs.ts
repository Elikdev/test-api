import schedule from "node-schedule";

export const scheduleRequestJobChecker = (date, funcToRun) => {
    console.log('jtre', '')
    return new Promise((resolve, reject) => {
        schedule.scheduleJob(date, () => {
            resolve(funcToRun)
        }).cancel(false);
    })
}
