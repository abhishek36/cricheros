const router = require("express").Router()
const PointTable = require("../model/pointTable.model")

router.post("/add", async (req, res) => {
    try {
        const data = new PointTable(req.body)
        const result = await data.save()
        res.status(201).jsonp({ message: "Added", statusCode: 201, data: result })
    } catch (error) {
        res.status(400).jsonp({ message: "unable to add", statusCode: 400 })
    }
})
router.get("/get", async (req, res) => {
    try {
        const result = await PointTable.find().sort({ pts: -1 })
        for (let i = 0; i < result.length - 1; i++) {
            if (result[i].pts === result[i + 1].pts) {
                if (result[i].nrr < result[i + 1].nrr) {
                    [result[i], result[i + 1]] = [result[i + 1], result[i]]
                }
            }
        }
        res.status(200).jsonp({ message: "data fetched", statusCode: 200, data: result })
    } catch (error) {
        console.log("error", error)
        res.status(400).jsonp({ message: "unable to fetched", statusCode: 400 })
    }
})
function runRate(runs, overs) {
    var toAdd = 0.167
    if (!Number.isInteger(overs)) {
        const str = overs.toString()
        const data = str.split(".")
        const calOfDec = data[1] * toAdd
        const calOfDecimal = calOfDec.toString().split(".")
        const excatOvers = data[0] + "." + calOfDecimal[1]
        return runs / excatOvers
    }
    else {
        return runs / overs
    }
}
function netRunRate(winRuns, lossRuns) {
    return winRuns - lossRuns
}
function decreaseBalls(overs) {
    var over = overs
    if (Number.isInteger(overs)) {
        return over = over - 0.5
    } else {
        return over = overs - 0.1
    }
}
function calTotalRunsAndOvers(played, runs, overs) {
    const data = played.split("/")
    const data1 = JSON.parse(data[0])
    const data2 = JSON.parse(data[1])
    console.log(data1, data2)
    if (Number.isInteger(data2)) {
        return (data1 + runs) + "/" + (data2 + overs)
    }
    else {
        const data3 = (JSON.stringify(data2)).split(".")
        if (Number.isInteger(overs)) {
            return data1 + runs + "/" + (JSON.parse(data3[0]) + overs) + "." + data3[1]
        }
        else {
            const data6 = (JSON.stringify(overs)).split(".")
            return (data1 + runs) + "/" + (JSON.parse(data3[0]) + JSON.parse(data6[0])) + "." + (JSON.parse(data3[1]) + JSON.parse(data6[1]))
        }
    }
}
router.post("/checkForRAGNAROK_STARS", async (req, res) => {
    try {
        var { WteamId, LteamId, postion, overs, choice, runs, chase } = req.body
        var runToRestrict, flag = 0, oversToRestrict, resWinNrr, response
        const winTeam = await PointTable.findById(WteamId)
        const lossTeam = await PointTable.findById(LteamId)
        if (choice == "bat") {
            const wrr = runRate(runs, overs)
            console.log("wrr ", wrr)
            //    check for the restrict
            for (let i = 0; i < runs; i++) {
                runs2 = runs - 1
                const lrr = runRate(runs2, overs)
                console.log("lrr ", lrr)
                const nrr = netRunRate(wrr, lrr)
                console.log("nrr ", nrr)
                const WinNrr = winTeam.nrr + nrr
                console.log("WinNrr ", WinNrr)
                const LossNrr = lossTeam.nrr - nrr
                console.log("LossNrr ", LossNrr)
                if (WinNrr > LossNrr) {
                    runToRestrict = runs2
                    resWinNrr = WinNrr
                    flag = 1
                }
                if (flag == 1) {
                    break;
                }
            }
            response = `if Treacherous score ${runs} runs in ${overs}  overs , Treacherous needs to restrict RAGNAROK_STARS between ${runToRestrict} to ${overs} in overs.Revised NRR of Treacherous will be between ${winTeam.nrr} to ${resWinNrr}`
            res.status(200).jsonp({ result: response })
        } else {
            const lrr = runRate(runs, overs)
            console.log("lrr ", lrr)
            //    check for the restrict
            for (let i = 0; i < overs; i++) {
                const netOvers = decreaseBalls(overs)
                const wrr = runRate(runs, netOvers)
                console.log("wrr ", wrr)
                const nrr = netRunRate(wrr, lrr)
                console.log("nrr ", nrr)
                const WinNrr = winTeam.nrr + nrr
                console.log("WinNrr ", WinNrr)
                const LossNrr = lossTeam.nrr - nrr
                console.log("LossNrr ", LossNrr)
                if (WinNrr > LossNrr) {
                    oversToRestrict = netOvers
                    resWinNrr = WinNrr
                    flag = 1
                }
                if (flag == 1) {
                    break;
                }
            }
            response = `Treacherous need to chase ${runs} runs between ${overs} to ${oversToRestrict} Overs. Revised NRR for Treacherous will be between ${winTeam.nrr} to ${resWinNrr}.`
            res.status(200).jsonp({ result: response })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).jsonp({ message: "unable to fetched", statusCode: 400 })
    }
})
router.post("/WinOnRAGNAROK_STARS", async (req, res) => {
    try {
        var { WteamId, LteamId, postion, overs, choice, runs, chase } = req.body
        var runToRestrict, flag = 0, oversToRestrict
        const winTeam = await PointTable.findById(WteamId)
        const lossTeam = await PointTable.findById(LteamId)
        if (choice == "bat") {
            const wrr = runRate(runs, overs)
            console.log("wrr ", wrr)
            const lrr = runRate(chase, overs)
            console.log("lrr ", lrr)
            const nrr = netRunRate(wrr, lrr)
            console.log("nrr ", nrr)
            const WinNrr = winTeam.nrr + nrr
            console.log("WinNrr ", WinNrr)
            const LossNrr = lossTeam.nrr - nrr
            console.log("LossNrr ", LossNrr)

            const winObj = {
                matches: winTeam.matches + 1,
                won: winTeam.won + 1,
                nrr: winTeam.nrr + nrr,
                pts: winTeam.pts + 2,
                for: calTotalRunsAndOvers(winTeam.for, runs, overs),
                against: calTotalRunsAndOvers(winTeam.against, chase, overs)
            }
            const winTeamRes = await PointTable.findByIdAndUpdate(WteamId, winObj)
            const lossObj = {
                matches: lossTeam.matches + 1,
                lost: lossTeam.lost + 1,
                nrr: LossNrr,
                for: calTotalRunsAndOvers(winTeam.for, chase, overs),
                against: calTotalRunsAndOvers(winTeam.against, runs, overs)
            }
            const lossTeamRes = await PointTable.findByIdAndUpdate(LteamId, lossObj)
            res.status(200).jsonp({ message: "We have to ristrict " + lossTeam.name + " on " })
        } else {
            const lrr = runRate(runs, overs)
            console.log("lrr ", lrr)
            //    check for the restrict
            const netOvers = decreaseBalls(overs)
            const wrr = runRate(runs, netOvers)
            console.log("wrr ", wrr)
            const nrr = netRunRate(wrr, lrr)
            console.log("nrr ", nrr)
            const WinNrr = winTeam.nrr + nrr
            console.log("WinNrr ", WinNrr)
            const LossNrr = lossTeam.nrr - nrr
            console.log("LossNrr ", LossNrr)
            const winObj = {
                matches: winTeam.matches + 1,
                won: winTeam.won + 1,
                nrr: WinNrr,
                pts: winTeam.pts + 2,
                for: calTotalRunsAndOvers(winTeam.for, chase, overs),
                against: calTotalRunsAndOvers(winTeam.against, runs, netOvers)
            }
            const winTeamRes = await PointTable.findByIdAndUpdate(WteamId, winObj)
            const lossObj = {
                matches: winTeam.matches + 1,
                lost: winTeam.lost + 1,
                nrr: LossNrr,
                for: calTotalRunsAndOvers(winTeam.for, runs, overs),
                against: calTotalRunsAndOvers(winTeam.against, chase, netOvers)
            }
            const lossTeamRes = await PointTable.findByIdAndUpdate(LteamId, lossObj)
            res.status(200).jsonp({ message: "runs should be chase in " + oversToRestrict, statusCode: 200 })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).jsonp({ message: "unable to fetched", statusCode: 400 })
    }
})
router.post("/checkForBHAYANKAR_XI", async (req, res) => {
    try {
        var { WteamId, LteamId, postion, overs, choice, runs, chase } = req.body
        var MinRunToRestrict, MaxRunToRestrict, flag = 0, oversToRestrict, response, resWinNrr
        const winTeam = await PointTable.findById(WteamId)
        const lossTeam = await PointTable.findById(LteamId)
        var tempArray = [], tempNrr = []
        if (choice == "bat") {
            const wrr = runRate(runs, overs)
            console.log("wrr ", wrr)
            //check for the restrict
            var runs2 = runs
            for (let i = 0; i < runs; i++) {
                runs2 = runs2 - 1
                const lrr = runRate(runs2, overs)
                console.log("lrr ", lrr)
                const nrr = netRunRate(wrr, lrr)
                console.log("nrr ", nrr)
                const WinNrr = winTeam.nrr + nrr
                console.log("WinNrr ", WinNrr)
                const LossNrr = lossTeam.nrr - nrr
                console.log("LossNrr ", LossNrr)
                if (WinNrr < LossNrr) {
                    console.log("===>>", runs2)
                    tempArray.push(runs2)
                    tempNrr.push(WinNrr)
                } else {
                    flag = 1
                }
                if (flag == 1) {
                    break;
                }
            }
            resWinNrr = tempNrr.pop()
            MaxRunToRestrict = tempArray[0],
                MinRunToRestrict = tempArray.pop()
            console.log(MaxRunToRestrict, MinRunToRestrict)
            response = `if Treacherous scores ${runs} runs in ${overs}  overs , Treacherous needs to restrict BHAYANKAR_XI between ${MinRunToRestrict} to ${MaxRunToRestrict} in ${overs}  overs.Revised NRR of Treacherous will be between ${winTeam.nrr} to ${resWinNrr}`
            res.status(200).jsonp({
                result: response
            })
        } else {
            const lrr = runRate(runs, overs)
            console.log("lrr ", lrr)
            //check for the restrict
            var decBalls = decreaseBalls(overs)
            for (let i = 0; i < overs; i++) {
                const wrr = runRate(runs, decBalls)
                console.log("wrr ", wrr)
                const nrr = netRunRate(wrr, lrr)
                console.log("nrr ", nrr)
                const WinNrr = winTeam.nrr + nrr
                console.log("WinNrr ", WinNrr)
                const LossNrr = lossTeam.nrr - nrr
                console.log("LossNrr ", LossNrr)
                if (LossNrr > WinNrr) {
                    tempArray.push(decBalls),
                        decBalls = decreaseBalls(decBalls)
                    tempNrr.push(WinNrr)
                } else {
                    flag = 1
                }
                if (flag == 1) {
                    break;
                }
            }
            resWinNrr = tempNrr.pop()
            response = `Treacherous need to chase ${runs} runs between ${tempArray[1]} to ${overs} Overs. Revised NRR for Treacherous will be between ${winTeam.nrr} to ${resWinNrr}.`
            res.status(200).jsonp({ result: response })
        }
    } catch (error) {
        console.log("error", error)
        res.status(400).jsonp({ message: "unable to fetched", statusCode: 400 })
    }
})
module.exports = router