const bcrypt = require("bcrypt");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });

    events.map(event => ({
      ...event._doc,
      _id: event.id,
      date: new Date(event._doc.date).toISOString(),
      creator: user.bind(this, event.creator)
    }));
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event.creator)
    };
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);

    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => ({
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      }));
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async args => {
    const { title, description, price, date } = args.eventInput;
    const event = new Event({
      title,
      description,
      price,
      date: new Date(date),
      creator: "5d22acb0197d2f09c8fdd97d"
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result.id,
        date: new Date(result._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator)
      };
      const creator = await User.findById("5d22acb0197d2f09c8fdd97d");

      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
  createUser: async args => {
    const { email, password } = args.userInput;
    try {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("User already exists.");
      }
      const hashedPassword = bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        password: hashedPassword
      });
      savedUser = await newUser.save();
      return { ...savedUser._doc, password: null, _id: savedUser.id };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5d22acb0197d2f09c8fdd97d",
      event: fetchedEvent
    });
    const result = await booking.save();
    return {
      ...result._doc,
      _id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    };
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      if (!booking) {
        throw new Error("Booking not found.");
      }
      const event = {
        ...booking.event._doc,
        _id: booking.event.id,
        creator: user.bind(this, booking.event._doc.creator)
      };
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
