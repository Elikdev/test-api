import schedule from "node-schedule";

export const scheduleRequestJobChecker = (date, funcToRun) => {
    return new Promise((resolve, reject) => {
        schedule.scheduleJob(date, () => {
            resolve(funcToRun)
        }).cancel(false);
    })
}
