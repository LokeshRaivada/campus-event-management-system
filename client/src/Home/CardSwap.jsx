import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef
} from "react";
import gsap from "gsap";
import "./CardSwap.css";

export const Card = forwardRef(({ customClass = "", className = "", ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`card ${customClass} ${className}`.trim()}
  />
));

Card.displayName = "Card";

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width = 320,
  height = 220,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  skewAmount = 6,
  easing = "elastic",
  children
}) => {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const order = useRef(childArr.map((_, i) => i));
  const intervalRef = useRef(null);

  useEffect(() => {
    const total = refs.length;

    refs.forEach((r, i) =>
      placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount)
    );

    const swap = () => {
      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      const tl = gsap.timeline();

      tl.to(elFront, {
        y: "+=200",
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);

      rest.forEach((idx, i) => {
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(refs[idx].current, { zIndex: slot.zIndex }, "promote");
        tl.to(
          refs[idx].current,
          { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);

      tl.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      tl.set(elFront, { zIndex: backSlot.zIndex }, "return");
      tl.to(
        elFront,
        { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
        "return"
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    swap();
    intervalRef.current = setInterval(swap, delay);
    return () => clearInterval(intervalRef.current);
  }, [cardDistance, verticalDistance, delay, skewAmount, easing]);

  return (
    <div className="card-swap-container">
      {childArr.map((child, i) =>
        isValidElement(child)
          ? cloneElement(child, { ref: refs[i], style: { ...(child.props.style || {}), width, height } })
          : child
      )}
    </div>
  );
};

export default CardSwap;
