import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Char "mo:base/Char";

persistent actor {

  type Signal = {
    from: Text;
    signalType: Text;
    data: Text;
    timestamp: Int;
  };

  type RoomInfo = {
    code: Text;
    hostId: Text;
    guestId: ?Text;
    moves: [Text];
    moveList: [Text];
    status: Text;
    signals: [Signal];
  };

  var roomCodes : [Text] = [];
  var roomHosts : [Text] = [];
  var roomGuests : [?Text] = [];
  var roomMoves : [[Text]] = [];
  var roomMoveLists : [[Text]] = [];
  var roomStatuses : [Text] = [];
  var roomSignals : [[Signal]] = [];
  var roomCounter : Nat = 0;

  transient let CHARS_ARRAY : [Char] = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z','2','3','4','5','6','7','8','9'];
  transient let CHARS_LEN : Nat = 32;

  func generateCode(seed: Nat) : Text {
    var code = "";
    var s = seed;
    var i = 0;
    while (i < 6) {
      let idx = s % CHARS_LEN;
      s := (s / CHARS_LEN) + (s * 7 + 13);
      code := code # Text.fromChar(CHARS_ARRAY[idx]);
      i += 1;
    };
    code
  };

  func findRoom(code: Text) : ?Nat {
    var i = 0;
    let len = roomCodes.size();
    while (i < len) {
      if (roomCodes[i] == code) return ?i;
      i += 1;
    };
    null
  };

  public func createRoom(hostId: Text) : async Text {
    roomCounter += 1;
    let seed = roomCounter + Int.abs(Time.now() % 1_000_000);
    let code = generateCode(seed);
    roomCodes := Array.append(roomCodes, [code]);
    roomHosts := Array.append(roomHosts, [hostId]);
    roomGuests := Array.append(roomGuests, [null]);
    roomMoves := Array.append(roomMoves, [[]]);
    roomMoveLists := Array.append(roomMoveLists, [[]]);
    roomStatuses := Array.append(roomStatuses, ["waiting"]);
    roomSignals := Array.append(roomSignals, [[]]);
    code
  };

  public func joinRoom(code: Text, guestId: Text) : async Bool {
    switch (findRoom(code)) {
      case null false;
      case (?i) {
        if (roomStatuses[i] == "waiting") {
          roomGuests := Array.tabulate(roomGuests.size(), func(j : Nat) : ?Text {
            if (j == i) ?guestId else roomGuests[j]
          });
          roomStatuses := Array.tabulate(roomStatuses.size(), func(j : Nat) : Text {
            if (j == i) "active" else roomStatuses[j]
          });
          true
        } else false;
      };
    };
  };

  public func pushMove(code: Text, fen: Text, san: Text) : async Bool {
    switch (findRoom(code)) {
      case null false;
      case (?i) {
        roomMoves := Array.tabulate(roomMoves.size(), func(j : Nat) : [Text] {
          if (j == i) Array.append(roomMoves[j], [fen]) else roomMoves[j]
        });
        roomMoveLists := Array.tabulate(roomMoveLists.size(), func(j : Nat) : [Text] {
          if (j == i) Array.append(roomMoveLists[j], [san]) else roomMoveLists[j]
        });
        true
      };
    };
  };

  public query func getRoom(code: Text) : async ?RoomInfo {
    switch (findRoom(code)) {
      case null null;
      case (?i) {
        ?{
          code = roomCodes[i];
          hostId = roomHosts[i];
          guestId = roomGuests[i];
          moves = roomMoves[i];
          moveList = roomMoveLists[i];
          status = roomStatuses[i];
          signals = roomSignals[i];
        }
      };
    };
  };

  public func postSignal(code: Text, from: Text, signalType: Text, data: Text) : async Bool {
    switch (findRoom(code)) {
      case null false;
      case (?i) {
        let sig : Signal = { from; signalType; data; timestamp = Time.now() };
        roomSignals := Array.tabulate(roomSignals.size(), func(j : Nat) : [Signal] {
          if (j == i) Array.append(roomSignals[j], [sig]) else roomSignals[j]
        });
        true
      };
    };
  };

  public func setFinished(code: Text) : async Bool {
    switch (findRoom(code)) {
      case null false;
      case (?i) {
        roomStatuses := Array.tabulate(roomStatuses.size(), func(j : Nat) : Text {
          if (j == i) "finished" else roomStatuses[j]
        });
        true
      };
    };
  };

};
