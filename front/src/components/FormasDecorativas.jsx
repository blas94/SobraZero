const FormasDecorativas = () => {
  return (
    <>
      <svg
        className="fixed top-0 left-0 w-[140px] h-[140px] md:w-[220px] md:h-[220px] pointer-events-none z-0"
        viewBox="0 0 200 200"
        style={{ opacity: 0.6 }}
      >
        <path
          d="M 0 0 L 0 200 Q 20 180 40 170 Q 60 160 80 150 Q 100 140 120 120 Q 140 100 150 80 Q 160 60 170 40 Q 180 20 200 0 Z"
          fill="#407b41"
        />
        <path
          d="M 0 180 A 180 180 0 0 1 180 0"
          fill="none"
          stroke="#3e4345"
          strokeWidth="3"
          opacity="0.7"
        />
      </svg>

      <svg
        className="fixed top-0 right-0 w-[140px] h-[140px] md:w-[220px] md:h-[220px] pointer-events-none z-0"
        viewBox="0 0 200 200"
        style={{ opacity: 0.6 }}
      >
        <path
          d="M 200 0 L 200 200 Q 180 180 170 160 Q 160 140 150 120 Q 140 100 120 80 Q 100 60 80 50 Q 60 40 40 30 Q 20 20 0 0 Z"
          fill="#3e4345"
        />
        <path
          d="M 200 180 A 180 180 0 0 0 20 0"
          fill="none"
          stroke="#407b41"
          strokeWidth="3"
          opacity="0.7"
        />
      </svg>

      <svg
        className="fixed bottom-0 left-0 w-[140px] h-[140px] md:w-[220px] md:h-[220px] pointer-events-none z-0"
        viewBox="0 0 200 200"
        style={{ opacity: 0.6 }}
      >
        <path
          d="M 0 200 L 0 0 Q 20 20 30 40 Q 40 60 50 80 Q 60 100 80 120 Q 100 140 120 150 Q 140 160 160 170 Q 180 180 200 200 Z"
          fill="#3e4345"
        />
        <path
          d="M 0 20 A 180 180 0 0 0 180 200"
          fill="none"
          stroke="#407b41"
          strokeWidth="3"
          opacity="0.7"
        />
      </svg>

      <svg
        className="fixed bottom-0 right-0 w-[140px] h-[140px] md:w-[220px] md:h-[220px] pointer-events-none z-0"
        viewBox="0 0 200 200"
        style={{ opacity: 0.6 }}
      >
        <path
          d="M 200 200 L 200 0 Q 180 20 160 30 Q 140 40 120 50 Q 100 60 80 80 Q 60 100 50 120 Q 40 140 30 160 Q 20 180 0 200 Z"
          fill="#407b41"
        />
        <path
          d="M 200 20 A 180 180 0 0 1 20 200"
          fill="none"
          stroke="#3e4345"
          strokeWidth="3"
          opacity="0.7"
        />
      </svg>
    </>
  );
};

export default FormasDecorativas;
