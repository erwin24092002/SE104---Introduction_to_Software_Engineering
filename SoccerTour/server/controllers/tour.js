import {
    TourModel,
    teamModel,
    playerModel,
    matchModel,
    matchResultModel,
    goalModel,
    userModel,
} from "../models/tourModel.js";
import mongoose from "mongoose";
import _ from "lodash";
import ErrorResponse from "../utils/errorResponse.js";

const helperFunction = {
    compareTeam: (a, b) => {
        if (a.point > b.point) return -1;
        else if (a.point < b.point) return 1;
        else if (a.point == b.point)
        {
            if (a.goalDifference > b.goalDifference)
                return -1
            else if (a.goalDifference < b.goalDifference)
                return 1
        }
        else return 0;
    },
    comparePlayer: (a, b) => {
        if (a.allGoals.length > b.allGoals.length) return -1;
        else if (a.allGoals.length < b.allGoals.length) return 1;
        else return 0;
    },
    formatDate: (date) => {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;
        return [day, month, year].join("-");
    },
};

// Teams
export const fetchOneTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).send("Invalid team id");
        }

        const team = await teamModel
            .findById(teamId)
            .populate({ path: "playerList", model: "playerModel" });
        if (!team) {
            return res.status(400).send("No team with that id");
        }
        res.status(200).json(team);
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

export const getTeams = async (req, res) => {
    try {
        const teams = await teamModel.find();

        res.status(200).json(teams);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const createTeam = async (req, res, next) => {
    try {
        const team = req.body;
        const user = req.user;
        const tour = await TourModel.findOne({ currentTour: true });

        // Validate
        if (tour.allTeams.length + 1 > tour.maxTeam)
            return next(
                new ErrorResponse("Gi???i ?????u ???? ?????t s??? l?????ng ?????i t???i ??a", 500)
            );

        if (
            !(
                team.playerList.length >= tour.minPlayerOfTeam &&
                team.playerList.length <= tour.maxPlayerOfTeam
            )
        ) {
            console.log(
                `S??? c???u th??? trong ?????i ph???i trong kho???ng t??? ${tour.minPlayerOfTeam} ?????n ${tour.maxPlayerOfTeam}`
            );
            return res
                .status(500)
                .send(
                    `S??? c???u th??? trong ?????i ph???i trong kho???ng t??? ${tour.minPlayerOfTeam} ?????n ${tour.maxPlayerOfTeam}`
                );
        }
        let foreignerCount = 0;
        if (
            team.playerList.some((player) => {
                if (player.nationality.toLowerCase() != "vi???t nam")
                    foreignerCount += 1;

                const newDate = new Date(player.dayOfBirth);
                return !(
                    2022 - newDate.getFullYear() >= tour.minAge &&
                    2022 - newDate.getFullYear() <= tour.maxAge
                );
            })
        ) {
            console.log(
                `Tu???i c???u th??? ph???i trong kho???ng t??? ${tour.minAge} ?????n ${tour.maxAge}`
            );
            return res
                .status(500)
                .send(
                    `Tu???i c???u th??? ph???i trong kho???ng t??? ${tour.minAge} ?????n ${tour.maxAge}`
                );
        }

        if (foreignerCount > tour.maxForeignPlayer) {
            console.log(
                `S??? c???u th??? n?????c ngo??i t???i ??a l?? ${tour.maxForeignPlayer} c???u th???`
            );
            return res
                .status(500)
                .send(
                    `S??? c???u th??? n?????c ngo??i t???i ??a l?? ${tour.maxForeignPlayer} c???u th???`
                );
        }

        // Convert birthday to form dd/mm/yyyy
        for (const player of team.playerList)
        {
            player.dayOfBirth = helperFunction.formatDate(player.dayOfBirth) 
        }

        // Get player Objects from Team data then save it
        team.userId = user._id;
        let flag = false;

        for (const registrationIndex in tour.registerList) {
            if (tour.registerList[registrationIndex].userId.equals(user._id)) {
                tour.registerList[registrationIndex] = team;
                flag = true;
                break;
            }
        }
        if (!flag) {
            tour.registerList.push(team);
        }
        await tour.save();
        console.log("Register sent to tour successfully");

        res.status(200).json(tour.registerList);
    } catch (er) {
        return res.status(500).send(er.message);
    }
};

// Calendar
export const createTour = async (req, res) => {
    try {
        const newTour = new TourModel(req.body);
        await newTour.save();

        console.log("Create new tour successfully");
        res.status(200).json(newTour);
    } catch (error) {
        res.status(404).json(error);
    }
};

export const getTour = async (req, res) => {
    try {
        const tour = await TourModel.findOne({ currentTour: true })
            .populate({
                path: "allTeams",
                model: "teamModel",
                populate: {
                    path: "playerList",
                    model: "playerModel",
                },
            })
            .populate({
                path: "players",
                model: "playerModel",
            })
            .populate({
                path: "calendar.awayMatches.matches",
                model: "matchModel",
                populate: [
                    {
                        path: "team1",
                        model: "teamModel",
                        populate: {
                            path: "playerList",
                            model: "playerModel",
                        },
                    },
                    {
                        path: "team2",
                        model: "teamModel",
                        populate: {
                            path: "playerList",
                            model: "playerModel",
                        },
                    },
                    {
                        path: "playerAttending.team1",
                        model: "playerModel",
                    },
                    {
                        path: "playerAttending.team2",
                        model: "playerModel",
                    },
                    {
                        path: "result",
                        model: "matchResultModel",
                        populate: [
                            {
                                path: "team1Result.goals",
                                model: "goalModel",
                                populate: [
                                    {
                                        path: "player",
                                        model: "playerModel",
                                    },
                                    {
                                        path: "assist",
                                        model: "playerModel",
                                    },
                                ],
                            },
                            {
                                path: "team2Result.goals",
                                model: "goalModel",
                                populate: [
                                    {
                                        path: "player",
                                        model: "playerModel",
                                    },
                                    {
                                        path: "assist",
                                        model: "playerModel",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
            .populate({
                path: "calendar.homeMatches.matches",
                model: "matchModel",
                populate: [
                    {
                        path: "team1",
                        model: "teamModel",
                        populate: {
                            path: "playerList",
                            model: "playerModel",
                        },
                    },
                    {
                        path: "team2",
                        model: "teamModel",
                        populate: {
                            path: "playerList",
                            model: "playerModel",
                        },
                    },
                    {
                        path: "result",
                        model: "matchResultModel",
                        populate: [
                            {
                                path: "team1Result.goals",
                                model: "goalModel",
                                populate: [
                                    {
                                        path: "player",
                                        model: "playerModel",
                                    },
                                    {
                                        path: "assist",
                                        model: "playerModel",
                                    },
                                ],
                            },
                            {
                                path: "team2Result.goals",
                                model: "goalModel",
                                populate: [
                                    {
                                        path: "player",
                                        model: "playerModel",
                                    },
                                    {
                                        path: "assist",
                                        model: "playerModel",
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });
        // .populate({
        //     path: "registerList",
        //     model: "teamModel",
        //     populate: {
        //         path: "playerList",
        //         model: "playerModel",
        //     },
        // });

        if (!tour) {
            const newTour = new TourModel({
                allTeams: [], // T???t c??? c??c ?????i
                players: [], // T???t c??? c??c c???u th???
                calendar: {
                    // L???ch thi ?????u
                    awayMatches: [
                        // L?????t ??i ch???a danh s??ch c??c v??ng thi ?????u v?? c??c tr???n trong v??ng thi ?????u ????
                        
                    ],
                    homeMatches: [
                        // L?????t v??? ch???a danh s??ch c??c v??ng thi ?????u v?? c??c tr???n trong v??ng thi ?????u ????
                        
                    ],
                },
                tourName: "",
                maxTeam: 10,
                minTeam: 5,
                maxPlayerOfTeam: 20,
                minPlayerOfTeam: 10,
                maxForeignPlayer: 5,
                maxAge: 60,
                minAge: 10,
                isAcceptingRegister: true,
                isClosed: false,
                winPoint: 3,
                drawPoint: 1,
                losePoint: 0,
                registerList: [],
                currentTour: true,
            });
            await newTour.save();

            console.log("Create new tour successfully");
            return res.status(200).json(newTour);
        }

        console.log("Get tour successfully");
        res.status(200).json(tour); 
    } catch (error) {
        console.log(error);
        res.status(404).json({ error });
    }
};

// Create all matches
export const updateTour = async (req, res) => {
    const tour = await TourModel.findOne({ currentTour: true });
    const data = req.body;

    if (data.allTeams.length < tour.minTeam) {
        return res.status(500).send("Kh??ng ????? s??? l?????ng ?????i y??u c???u c???a gi???i");
    }

    data.allTeams.sort();
    const roundArray = _.cloneDeep(data.allTeams);

    if (data.allTeams.length % 2 == 0) {
        const maxRound = data.allTeams.length - 1;
        const matchPerRound = data.allTeams.length / 2;
        let i = 0;
        let z = 0;
        for (let round = 1; round <= maxRound; round++) {
            const roundTemplate1 = {
                round: round, // V??ng thi ?????u
                timeBegin: null,
                timeEnd: null,
                matches: (function () {
                    const allMatches = [];
                    for (let i = 1; i <= matchPerRound; i++) {
                        allMatches.push({
                            team1: null,
                            team2: null,
                            field: null,
                            vongthidau: null,
                            tenluotthidau: null,
                            date: null,
                            time: null,
                            result: {
                                matchLength: {
                                    minute: null,
                                    second: null,
                                },
                                team1Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                                team2Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                            },
                            playerAttending: {
                                team1: [],
                                team2: [],
                            },
                        });
                    }
                    return allMatches;
                })(), // C??c tr???n trong v??ng thi ?????u n??y
            };

            for (let match of roundTemplate1.matches) {
                match.team1 = roundArray[i];
                i++;
                match.team2 = roundArray[i];
                i++;
                match.field = match.team1.homeGround;
                match.vongthidau = round;
                match.tenluotthidau = "L?????t ??i";
            }
            data.calendar.awayMatches.push(roundTemplate1);

            const roundTemplate2 = {
                round: round + maxRound, // V??ng thi ?????u
                timeBegin: null,
                timeEnd: null,
                matches: (function () {
                    const allMatches = [];
                    for (let i = 1; i <= matchPerRound; i++) {
                        allMatches.push({
                            team1: null,
                            team2: null,
                            field: null,
                            vongthidau: null,
                            tenluotthidau: null,
                            date: null,
                            time: null,
                            result: {
                                matchLength: {
                                    minute: null,
                                    second: null,
                                },
                                team1Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                                team2Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                            },
                            playerAttending: {
                                team1: [],
                                team2: [],
                            },
                        });
                    }
                    return allMatches;
                })(), // C??c tr???n trong v??ng thi ?????u n??y
            };

            for (let match of roundTemplate2.matches) {
                match.team2 = roundArray[z];
                z++;
                match.team1 = roundArray[z];
                z++;
                match.field = match.team1.homeGround;
                match.vongthidau = round;
                match.tenluotthidau = "L?????t v???";
            }
            data.calendar.homeMatches.push(roundTemplate2);

            let temp = roundArray[1];
            for (let j = 1; j < roundArray.length - 1; j++) {
                roundArray[j] = roundArray[j + 1];
            }
            roundArray[roundArray.length - 1] = temp;
            i = 0;
            z = 0;
        }
    } else {
        const maxRound = data.allTeams.length;
        const matchPerRound = parseInt(data.allTeams.length / 2);
        let i = 1;
        let z = 1;
        for (let round = 1; round <= maxRound; round++) {
            const roundTemplate1 = {
                round: round, // V??ng thi ?????u
                timeBegin: null,
                timeEnd: null,
                matches: (function () {
                    const allMatches = [];
                    for (let i = 1; i <= matchPerRound; i++) {
                        allMatches.push({
                            team1: null,
                            team2: null,
                            field: null,
                            vongthidau: null,
                            tenluotthidau: null,
                            date: null,
                            time: null,
                            result: {
                                team1Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                                team2Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                            },
                        });
                    }
                    return allMatches;
                })(), // C??c tr???n trong v??ng thi ?????u n??y
            };

            for (let match of roundTemplate1.matches) {
                match.team1 = roundArray[i];
                i++;
                match.team2 = roundArray[i];
                i++;
                match.field = match.team1.homeGround;
                match.vongthidau = round;
                match.tenluotthidau = "L?????t ??i";
            }
            data.calendar.awayMatches.push(roundTemplate1);

            const roundTemplate2 = {
                round: round + maxRound, // V??ng thi ?????u
                timeBegin: null,
                timeEnd: null,
                matches: (function () {
                    const allMatches = [];
                    for (let i = 1; i <= matchPerRound; i++) {
                        allMatches.push({
                            team1: null,
                            team2: null,
                            field: null,
                            vongthidau: null,
                            tenluotthidau: null,
                            date: null,
                            time: null,
                            result: {
                                team1Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                                team2Result: {
                                    totalGoals: null,
                                    goals: [],
                                },
                            },
                        });
                    }
                    return allMatches;
                })(), // C??c tr???n trong v??ng thi ?????u n??y
            };

            for (let match of roundTemplate2.matches) {
                match.team2 = roundArray[z];
                z++;
                match.team1 = roundArray[z];
                z++;
                match.field = match.team1.homeGround;
                match.vongthidau = round;
                match.tenluotthidau = "L?????t v???";
            }
            data.calendar.homeMatches.push(roundTemplate2);

            let temp = roundArray[0];
            for (let j = 0; j < roundArray.length - 1; j++) {
                roundArray[j] = roundArray[j + 1];
            }
            roundArray[roundArray.length - 1] = temp;
            i = 1;
            z = 1;
        }
    }

    const originalData = JSON.parse(JSON.stringify(data));

    for (let homeOrAway of ["awayMatches", "homeMatches"]) {
        for (const round in data.calendar[homeOrAway]) {
            const allMatchesAddress = [];
            for (const match in data.calendar[homeOrAway][round].matches) {
                // Initialize result model and save it
                const newResultModel = await matchResultModel(
                    data.calendar[homeOrAway][round].matches[match].result
                );
                await newResultModel.save();
                data.calendar[homeOrAway][round].matches[match].result =
                    mongoose.Types.ObjectId(newResultModel._id);
                originalData.calendar[homeOrAway][round].matches[match].result =
                    newResultModel;

                data.calendar[homeOrAway][round].matches[match].team1 =
                    mongoose.Types.ObjectId(
                        data.calendar[homeOrAway][round].matches[match].team1
                            ._id
                    );
                data.calendar[homeOrAway][round].matches[match].team2 =
                    mongoose.Types.ObjectId(
                        data.calendar[homeOrAway][round].matches[match].team2
                            ._id
                    );

                const newMatch = await matchModel(
                    data.calendar[homeOrAway][round].matches[match]
                );
                await newMatch.save();
                allMatchesAddress.push(mongoose.Types.ObjectId(newMatch._id));
                originalData.calendar[homeOrAway][round].matches[match]._id =
                    newMatch._id;
            }
            data.calendar[homeOrAway][round].matches = allMatchesAddress;
        }
    }
    console.log("Save all matches successfully");
    data.isAcceptingRegister = false;
    const dataModel = await TourModel.findByIdAndUpdate(data._id, data, {
        new: true,
    });
    console.log("Save calendar successfully");
    originalData.isAcceptingRegister = false;
    res.status(200).json(originalData);
};

export const updateMatchData = async (req, res) => {
    const { id: _id } = req.params;
    const match = JSON.parse(JSON.stringify(req.body));
    if (!mongoose.Types.ObjectId.isValid(_id))
        return res.status(500).send("No match with that id");
    match.team1 = match.team1._id;
    match.team2 = match.team2._id;
    const updatedMatch = await matchModel.findByIdAndUpdate(_id, match, {
        new: true,
    });
    console.log("Update match successfully");
    res.json(req.body);
};

export const updateMatchResult = async (req, res) => {
    try {
        const { id: _id } = req.params;

        const matchResult = _.cloneDeep(req.body);
        const oldMatchResult = await matchModel.findOne({ _id: _id }).populate({
            path: "result",
            model: "matchResultModel",
            populate: [
                {
                    path: "team1Result.goals",
                    model: "goalModel",
                },
                {
                    path: "team2Result.goals",
                    model: "goalModel",
                },
            ],
        });

        if (!mongoose.Types.ObjectId.isValid(_id))
            return res.status(403).send("No match with that id");

        // Validate
        const tour = await TourModel.findOne({ currentTour: true });
        const sumTime =
            parseInt(matchResult.matchLength.minute) * 60 +
            parseInt(matchResult.matchLength.second);
        let sumResult1 = 0;
        let sumResult2 = 0;
        for (let teamiResult of ["team1Result", "team2Result"]) {
            for (const goal of matchResult[teamiResult].goals) {
                if (
                    parseInt(goal.minute) * 60 + parseInt(goal.second) >
                        sumTime ||
                    parseInt(goal.minute) * 60 + parseInt(goal.second) < 0
                ) {
                    {
                        console.log("Th???i ??i???m c???a b??n th???ng kh??ng h???p l???");
                        return res
                            .status(500)
                            .send("Th???i ??i???m c???a b??n th???ng kh??ng h???p l???");
                    }
                }

                // Validate sum goal
                if (goal.type !== "OG") {
                    if (teamiResult === "team1Result") sumResult1 += 1;
                    else sumResult2 += 1;
                } else {
                    if (teamiResult === "team2Result") sumResult1 += 1;
                    else sumResult2 += 1;
                }
            }
        }
        if (
            sumResult1 !== parseInt(matchResult.team1Result.totalGoals) ||
            sumResult2 !== parseInt(matchResult.team2Result.totalGoals)
        ) {
            console.log("Danh s??ch b??n th???ng v?? t??? s??? kh??ng ?????ng nh???t");
            return res
                .status(500)
                .send("Danh s??ch b??n th???ng v?? t??? s??? kh??ng ?????ng nh???t");
        }

        const setList = new Set();
        for (let teami of ["team1Result", "team2Result"]) {
            for (const goal of matchResult[teami].goals) {
                const time = parseInt(goal.minute) * 60 + parseInt(goal.second);
                setList.add(time);
            }
        }
        if (setList.size != sumResult1 + sumResult2) {
            return res.status(500).send("T???n t???i hai b??n th???ng c??ng th???i ??i???m");
        }
        //.................................................

        // Create goal model to have reference
        // Remove goal and assist in players
        for (let teami of ["team1Result", "team2Result"]) {
            for (const goal of oldMatchResult.result[teami].goals) {
                const player = await playerModel
                    .findOne({
                        _id: goal.player,
                    })
                    .lean();
                _.remove(player.allGoals, (goalId) => {
                    return goalId.equals(goal._id);
                });
                await playerModel.findByIdAndUpdate(player._id, player);

                const assistant = await playerModel
                    .findOne({
                        _id: goal.assist,
                    })
                    .lean();

                _.remove(assistant.allAssists, (goalId) => {
                    return goalId.equals(goal._id);
                });
                await playerModel.findByIdAndUpdate(assistant._id, assistant);

                console.log("Delete goal and assist from player");
            }
        }
        // Create new Goal and add to players
        for (let teami of ["team1Result", "team2Result"]) {
            const goalsAddress = [];
            for (const goal of matchResult[teami].goals) {
                delete goal["_id"];
                const newGoalModel = await goalModel(goal);
                await newGoalModel.save();
                goalsAddress.push(newGoalModel._id);

                // save goal an assistant
                const player = await playerModel.findOne({
                    _id: newGoalModel.player,
                });
                player.allGoals.push(newGoalModel._id);
                player.save();

                const assistant = await playerModel.findOne({
                    _id: newGoalModel.assist,
                });
                assistant.allAssists.push(newGoalModel._id);
                assistant.save();
                console.log("Added goal and assist to player");
            }
            if (goalsAddress.length > 0)
                _.update(matchResult, `${teami}.goals`, () => goalsAddress);
        }

        // Add game win or draw or lose
        const match = await matchModel.findOne({ _id: _id }).lean();
        const team1 = await teamModel.findOne({ _id: match.team1 }).lean();
        const team2 = await teamModel.findOne({ _id: match.team2 }).lean();
        const oldoldMatchResult = await matchResultModel.findOne({
            _id: match.result._id,
        });
        // Delete old first
        for (const gameWinId in team1.gameWin) {
            if (team1.gameWin[gameWinId].equals(match.result._id)) {
                team1.point -= parseInt(tour.winPoint);
                team1.gameWin.splice(gameWinId, 1);
                console.log("Delete Win");
                team1.goalDifference =
                    parseInt(team1.goalDifference) -
                    parseInt(oldoldMatchResult.team1Result.totalGoals) +
                    parseInt(oldoldMatchResult.team2Result.totalGoals);
                break;
            }
        }
        for (const gameWinId in team1.gameDraw) {
            if (team1.gameDraw[gameWinId].equals(match.result._id)) {
                team1.point -= parseInt(tour.drawPoint);
                team1.gameDraw.splice(gameWinId, 1);
                console.log("Delete draw");
                team1.goalDifference =
                    parseInt(team1.goalDifference) -
                    parseInt(oldoldMatchResult.team1Result.totalGoals) +
                    parseInt(oldoldMatchResult.team2Result.totalGoals);
                break;
            }
        }
        for (const gameWinId in team1.gameLose) {
            if (team1.gameLose[gameWinId].equals(match.result._id)) {
                team1.point -= tour.losePoint;
                team1.gameLose.splice(gameWinId, 1);
                console.log("Delete lose");
                team1.goalDifference =
                    parseInt(team1.goalDifference) -
                    parseInt(oldoldMatchResult.team1Result.totalGoals) +
                    parseInt(oldoldMatchResult.team2Result.totalGoals);
                break;
            }
        }

        console.log(oldoldMatchResult.team1Result.totalGoals);
        console.log(oldoldMatchResult.team2Result.totalGoals);
        console.log(team1.goalDifference);

        for (const gameWinId in team2.gameWin) {
            if (team2.gameWin[gameWinId].equals(match.result._id)) {
                team2.point -= parseInt(tour.winPoint);
                team2.gameWin.splice(gameWinId, 1);
                console.log("Delete Win");
                team2.goalDifference =
                    parseInt(team2.goalDifference) -
                    parseInt(oldoldMatchResult.team2Result.totalGoals) +
                    parseInt(oldoldMatchResult.team1Result.totalGoals);
                break;
            }
        }
        for (const gameWinId in team2.gameDraw) {
            if (team2.gameDraw[gameWinId].equals(match.result._id)) {
                team2.point -= parseInt(tour.drawPoint);
                team2.gameDraw.splice(gameWinId, 1);
                console.log("Delete draw");
                team2.goalDifference =
                    parseInt(team2.goalDifference) -
                    parseInt(oldoldMatchResult.team2Result.totalGoals) +
                    parseInt(oldoldMatchResult.team1Result.totalGoals);
                break;
            }
        }
        for (const gameWinId in team2.gameLose) {
            if (team2.gameLose[gameWinId].equals(match.result._id)) {
                team2.point -= tour.losePoint;
                team2.gameLose.splice(gameWinId, 1);
                console.log("Delete lose");

                team2.goalDifference =
                    parseInt(team2.goalDifference) -
                    parseInt(oldoldMatchResult.team2Result.totalGoals) +
                    parseInt(oldoldMatchResult.team1Result.totalGoals);

                break;
            }
        }

        const updatedMatchResult = await matchResultModel.findByIdAndUpdate(
            matchResult._id,
            matchResult,
            {
                new: true,
            }
        );
        console.log("Update match result successfully");

        if (
            parseInt(matchResult.team1Result.totalGoals) >
            parseInt(matchResult.team2Result.totalGoals)
        ) {
            team1.gameWin.push(updatedMatchResult._id);
            team2.gameLose.push(updatedMatchResult._id);

            team1.point += parseInt(tour.winPoint);
            team2.point += tour.losePoint;

            console.log("Team1 win");
        } else if (
            parseInt(matchResult.team1Result.totalGoals) <
            parseInt(matchResult.team2Result.totalGoals)
        ) {
            team1.gameLose.push(updatedMatchResult._id);
            team2.gameWin.push(updatedMatchResult._id);

            team2.point += parseInt(tour.winPoint);
            team1.point += tour.losePoint;

            console.log("Team2 win");
        } else {
            team1.gameDraw.push(updatedMatchResult._id);
            team2.gameDraw.push(updatedMatchResult._id);

            team1.point += parseInt(tour.drawPoint);
            team2.point += parseInt(tour.drawPoint);

            console.log("Draw");
        }

        team1.goalDifference =
            parseInt(team1.goalDifference) +
            parseInt(matchResult.team1Result.totalGoals) -
            parseInt(matchResult.team2Result.totalGoals);
        team2.goalDifference =
            parseInt(team2.goalDifference) +
            parseInt(matchResult.team2Result.totalGoals) -
            parseInt(matchResult.team1Result.totalGoals);

        console.log(oldoldMatchResult.team1Result.totalGoals);
        console.log(oldoldMatchResult.team2Result.totalGoals);
        console.log(team1.goalDifference);

        await teamModel.findByIdAndUpdate(team1._id, team1);
        await teamModel.findByIdAndUpdate(team2._id, team2);
        console.log("Save match win lose successfully");
        //...............................................

        // Populating player objects in every goal to send back for rendering
        const updatedMatchResultForResponse = await updatedMatchResult.populate(
            [
                {
                    path: "team1Result.goals",
                    model: "goalModel",
                    populate: [
                        {
                            path: "player",
                            model: "playerModel",
                        },
                        {
                            path: "assist",
                            model: "playerModel",
                        },
                    ],
                },
                {
                    path: "team2Result.goals",
                    model: "goalModel",
                    populate: [
                        {
                            path: "player",
                            model: "playerModel",
                        },
                        {
                            path: "assist",
                            model: "playerModel",
                        },
                    ],
                },
            ]
        );

        res.status(200).json(updatedMatchResultForResponse);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.message);
    }
};

export const getPlayers = async (req, res) => {
    try {
        const data = req.body;
        const result = [];
        for (const playerAdd of data) {
            const player =
                typeof playerAdd === "string" || playerAdd instanceof String
                    ? await playerModel.findOne({ _id: playerAdd })
                    : playerAdd;
            result.push(player);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(404);
    }
};

export const getRank = async (req, res) => {
    try {
        const tour = await TourModel.findOne({ currentTour: true }).populate({
            path: "allTeams",
            model: "teamModel",
        });
        tour.allTeams.sort(helperFunction.compareTeam);
        console.log("Get Rank successfully");
        res.status(200).json(tour.allTeams);
    } catch (error) {
        res.status(404).json(error);
    }
};

export const getRankPlayer = async (req, res) => {
    try {
        const tour = await TourModel.findOne({ currentTour: true }).populate({
            path: "players",
            model: "playerModel",
        });
        tour.players.sort(helperFunction.comparePlayer);
        console.log("Get Rank Player successfully");
        res.status(200).json(tour.players);
    } catch (error) {
        res.status(404).json(error);
    }
};

export const changeTourRule = async (req, res) => {
    try {
        const tour = await TourModel.findOne({ currentTour: true });
        const newTourChange = req.body;

        // Validation
        if (
            parseInt(newTourChange.minTeam) > parseInt(newTourChange.maxTeam) ||
            parseInt(newTourChange.minAge) > parseInt(newTourChange.maxAge) ||
            parseInt(newTourChange.minPlayerOfTeam) >parseInt(newTourChange.maxPlayerOfTeam)
        )
            return res.status(400).send("Th??ng s??? min max kh??ng h???p l???")
        if (
            parseInt(newTourChange.maxPlayerOfTeam) < parseInt(newTourChange.maxForeignPlayer)
        )
            return res.status(400).send("S??? c???u th??? n?????c ngo??i ph???i nh??? h??n s??? c???u th??? t???i ??a")
        //-----------------------------------------------------------------

        const initializeTourData = {
            tourName: tour.tourName,
            maxTeam: tour.maxTeam,
            minTeam: tour.minTeam,
            maxPlayerOfTeam: tour.maxPlayerOfTeam,
            minPlayerOfTeam: tour.minPlayerOfTeam,
            maxForeignPlayer: tour.maxForeignPlayer,
            maxAge: tour.maxAge,
            minAge: tour.minAge,
        };

        await TourModel.findOneAndUpdate(
            { ...initializeTourData },
            { $set: newTourChange },
            { new: true }
        );
        console.log("Update tour rule successfully");
        res.status(200).send(newTourChange);
    } catch (error) {
        res.status(404).send(error.message);
    }
};

export const acceptRegister = async (req, res, next) => {
    try {
        const registration = req.body;
        const user = await userModel.findById(registration.userId);
        const tour = await TourModel.findOne({ currentTour: true });

        const listPlayer = [];
        for (const player of registration.playerList) {
            player.teamName = registration.teamName;
            if (player._id) {
                await playerModel.findByIdAndUpdate(player._id, player);
                listPlayer.push(player._id);
            } else {
                const pl = await playerModel(player);
                await pl.save();
                listPlayer.push(pl._id);
                tour.players.push(pl._id);
            }
        }
        registration.playerList = listPlayer;
        console.log("Saved player successfully");

        // Create Team from team data and save it
        delete registration["userId"];
        if (registration._id) {
            await teamModel.findByIdAndUpdate(registration._id, registration);
            console.log("Update team successfully");

            _.remove(tour.registerList, (registration) => {
                return registration.userId.equals(user._id);
            });

            await TourModel.findByIdAndUpdate(tour._id, tour);
        } else {
            const newTeam = await teamModel(registration);
            await newTeam.save();
            console.log("Saved team successfully");

            // newTeam.playerList.forEach((playerId) => {
            //     tour.players.push(playerId);
            // });

            tour.allTeams.push(newTeam._id);

            _.remove(tour.registerList, (registration) => {
                return registration.userId.equals(user._id);
            });

            await TourModel.findByIdAndUpdate(tour._id, tour);

            user.team = newTeam._id;
            await user.save();
        }

        console.log("Team accepted successfully");
        next();
    } catch (error) {
        res.status(404).send(error.message);
    }
};

export const deleteRegister = async (req, res, next) => {
    try {
        const registration = req.body;
        const tour = await TourModel.findOne({ currentTour: true });

        _.remove(tour.registerList, (teamRegiter) => {
            return teamRegiter.userId.toString() === registration.userId;
        });

        await TourModel.findByIdAndUpdate(tour._id, tour);
        console.log("Register delete successfully");

        res.status(200).json(tour.registerList);
    } catch (error) {
        res.status(404).send(error.message);
    }
};

export const endTour = async (req, res) => {
    try {
        const tour = await TourModel.findOne({ currentTour: true });
        tour.currentTour = false;
        await tour.save();

        const newTour = await TourModel.create({
            allTeams: [], // T???t c??? c??c ?????i
            players: [], // T???t c??? c??c c???u th???
            calendar: {
                // L???ch thi ?????u
                awayMatches: [
                    // L?????t ??i ch???a danh s??ch c??c v??ng thi ?????u v?? c??c tr???n trong v??ng thi ?????u ????
                    
                ],
                homeMatches: [
                    // L?????t v??? ch???a danh s??ch c??c v??ng thi ?????u v?? c??c tr???n trong v??ng thi ?????u ????
                    
                ],
            },
            tourName: "",
            maxTeam: 0,
            minTeam: 0,
            maxPlayerOfTeam: 0,
            minPlayerOfTeam: 0,
            maxForeignPlayer: 0,
            maxAge: 0,
            minAge: 0,
            isAcceptingRegister: true,
            isClosed: false,
            dateStart: null,
            dateEnd: null,
            winPoint: 3,
            drawPoint: 1,
            losePoint: 0,
            registerList: [],
            currentTour: true,
        });
        console.log("Create new tour successfully");
        res.status(200).json(newTour);
    } catch (error) {
        res.status(404).send(error.message);
    }
};
