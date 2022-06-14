import { motion } from "framer-motion";

const MotionHoc = (Component) => {
  return function HOC() {
    return (
      <motion.div
        initial={{ x: 500 }}
        animate={{
          x: 0,
          transition: { duration: 0.5, type: "spring" },
        }}
        exit={{
          y: -500,
          transition: { duration: 0.5, type: "spring", ease: "easeInOut" },
        }}
      >
        <Component />
      </motion.div>
    );
  };
};

export default MotionHoc;