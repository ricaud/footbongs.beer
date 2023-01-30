import Head from "next/head";
import Link from "next/link";

export default function Constitution() {
  const introduction =
    "We the People of Footbongs and Beerball Fantasy Football, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the Integrity of the Bong.";

  const rules = [
    "The crime of accumulating the lowest fantasy points in a given week warrants a film submission to the chat starring yourself bonging a beer by 24 hours after the final game of the week at the latest.",
    "If you find yourself committed to a bong and fail to fulfill the transaction by the given due date, you will be gracefully gifted an additional 24 hours to complete your transaction with an interest rate of one additional bong per 24 hours.",
    "Any dispute that cannot be objectively settled via the above rules will be resolved via a unanimous vote in the chat.",
  ];

  return (
    <>
      <Head>
        <title>CONSTITUTION</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="center">
        {/* CSS Scroll - Start */}
        <div className="canvas">
          <div className="scrollEnd">
            <div className="scrollTubeLeft"></div>
            <div className="scrollTubeRight"></div>
            <div className="scrollEndPaper"></div>
          </div>
          <div className="scrollMain">
            {/* <div className="title">Monkey's Say...</div> */}
            <div className="title-wethepeople">We The People</div>
            <div className="rule center">{introduction}</div>
            <div className="ruleList">
              {rules.map((rule, idx) => {
                return (
                  <div key={idx} className="rule">
                    {idx + 1 + ". " + rule}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="scrollEnd">
            <div className="scrollTubeLeft"></div>
            <div className="scrollTubeRight"></div>
            <div className="scrollEndPaper"></div>
          </div>
        </div>
        {/* CSS Scroll - End */}

        <div className="link">
          <Link href="/">Home</Link>
        </div>
      </main>
    </>
  );
}
