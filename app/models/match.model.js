const Player = require('./player.model');


module.exports = mongoose => {
    const Match = mongoose.model(
      "Match",
      mongoose.Schema(
        {
          Name: String,
          dateTimePlanned:  { type: Date, required: truee },
          dateTimeStart:  Date,
          dateTimeEnd:  Date,
          homeTeam:  { type: Team, required: true },
          awayTeam:  { type: Team, required: true },
          players: { type: Player[]}

        },
        { timestamps: true }
      )
    );
  
    return Tag;
  };