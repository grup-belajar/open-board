const FooterBoardPage = () => {
    return(
        <footer className="flex flex-row justify-between bg-black h-30 items-center px-1.5 md:px-20">
            <h2 className="font-display text-white text-sm md:text-xl">&copy; 2026 OPENBOARD</h2>
                <ul className="flex flex-row gap-2 md:gap-10 text-white font-display text-xs md:text-base">
                    <li>PRIVACY</li>
                    <li>TERMS</li>
                    <li>DISCORD</li>
                    <li>GITHUB</li>
                </ul>
        </footer>
    )
}

export default FooterBoardPage