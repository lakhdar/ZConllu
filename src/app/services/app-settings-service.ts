import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  conlludirPath="appdata/local/conllus";
  jsonDBPath="conllus.json";
  pageName="P_";
  pageSize=10;
  
  constructor() {}

  UPOS=[
    {name:"ADJ",value: "adjective"},
    {name:"ADP",value: "adposition"},
    {name:"ADV",value: "adverb"},
    {name:"AUX",value: "auxiliary"},
    {name:"CCONJ",value: "coordinating conjunction"},
    {name:"DET",value: "determiner"},
    {name:"INTJ",value: "interjection"},
    {name:"NOUN",value: "noun"},
    {name:"NUM",value: "numeral"},
    {name:"PART",value: "particle"},
    {name:"PRON",value: "pronoun"},
    {name:"PROPN",value: "proper noun"},
    {name:"PUNCT",value: "punctuation"},
    {name:"SCONJ",value: "subordinating conjunction"},
    {name:"SYM",value: "symbol"},
    {name:"VERB",value: "verb"},
    {name:"X",value: "other"},
    {name:"_",value: "_"},
  ]
  DEPREL=[
    {name:"acl",value: "clausal modifier of noun (adjectival clause)"},
    {name:"advcl",value: "adverbial clause modifier"},
    {name:"advmod",value: "adverbial modifier"},
    {name:"amod",value: "adjectival modifier"},
    {name:"appos",value: "appositional modifier"},
    {name:"aux",value: "auxiliary"},
    {name:"case",value: "case marking"},
    {name:"cc",value: "coordinating conjunction"},
    {name:"ccomp",value: "clausal complement"},
    {name:"clf",value: "classifier"},
    {name:"compound",value: "compound"},
    {name:"conj",value: "conjunct"},
    {name:"cop",value: "copula"},
    {name:"csubj",value: "clausal subject"},
    {name:"dep",value: "unspecified dependency"},
    {name:"det",value: "determiner"},
    {name:"discourse",value: "discourse element"},
    {name:"dislocated",value: "dislocated elements"},
    {name:"expl",value: "expletive"},
    {name:"fixed",value: "fixed multiword expression"},
    {name:"flat",value: "flat multiword expression"},
    {name:"goeswith",value: "goes with"},
    {name:"iobj",value: "indirect object"},
    {name:"list",value: "list"},
    {name:"mark",value: "marker"},
    {name:"nmod",value: "nominal modifier"},
    {name:"nsubj",value: "nominal subject"},
    {name:"nummod",value: "numeric modifier"},
    {name:"obj",value: "object"},
    {name:"obl",value: "oblique nominal"},
    {name:"orphan",value: "orphan"},
    {name:"parataxis",value: "parataxis"},
    {name:"punct",value: "punctuation"},
    {name:"reparandum",value: "overridden disfluency"},
    {name:"root",value: "root"},
    {name:"vocative",value: "vocative"},
    {name:"xcomp",value: "open clausal complement"},
    {name:"_",value: "_"},
  ];

  FEATS=[
    {name:"Abbr",value: "abbreviation",items:[
      {name:"Yes",value: "it is abbreviation"}
    ]},
    {name:"Number[abs]",value: "number agreement with absolutive argument",
    items:[
      {name:"Sing",value: "singular"},
      {name:"Plur",value: "plural"}
    ]},
    {name:"Number[erg]",value: "number agreement with ergative argument",
    items:[
      {name:"Sing",value: "singular"},
      {name:"Plur",value: "plural"}
    ]},
    {name:"Number[dat]",value: "number agreement with dative  argument",
    items:[
      {name:"Sing",value: "singular"},
      {name:"Plur",value: "plural"}
    ]},
    {name:"Person[abs]",value: "Person agreement with absolutive argument",
    items:[
      {name:"1",value: "first person"},
      {name:"2",value: "second person"},
      {name:"3",value: "third person"}
    ]},
    {name:"Person[erg]",value: "Person agreement with ergative argument",
    items:[
      {name:"1",value: "first person"},
      {name:"2",value: "second person"},
      {name:"3",value: "third person"}
    ]},
    {name:"Person[dat]",value: "Person agreement with dative  argument",
    items:[
      {name:"1",value: "first person"},
      {name:"2",value: "second person"},
      {name:"3",value: "third person"}
    ]},
    
    {name:"Polite[abs]",value: "politeness agreement with agreement with absolutive argument",
    items:[
      {name:"Inf",value: "informal"},
      {name:"Pol",value: "polite, formal"}
    ]},
    {name:"Polite[erg]",value: "politeness agreement with agreement with ergative argument",
    items:[
      {name:"Inf",value: "informal"},
      {name:"Pol",value: "polite, formal"}
    ]},
    {name:"Polite[dat]",value: "politeness agreement with agreement with dative  argument",
    items:[
      {name:"Inf",value: "informal"},
      {name:"Pol",value: "polite, formal"}
    ]},
    {name:"AdpType",value: "adposition type",
    items:[
      {name:"Prep",value: "preposition"},
      {name:"Post",value: "postposition"},
      {name:"Voc",value: "vocalized preposition"},
      {name:"Circ",value: "circumposition"}
    ]},
    {name:"AdvType",value: "adverb type",
    items:[
      {name:"Man",value: "adverb of manner ",description:"('how')"},
      {name:"Loc",value: "adverb of location ",description:"('where, where to, where from')"},
      {name:"Tim",value: "adverb of time ",description:"('when, since when, till when')"},
      {name:"Deg",value: "adverb of quantity or degree ",description:"('how much')"},
      {name:"Cau",value: "adverb of cause ",description:"('why')"},
      {name:"Mod",value: "adverb of modal nature ",description:"('à propos')"},
      {name:"Sta",value: "adverb of state",description:"('ex: Czech chyba (wrong)')"},
      {name:"Ex",value: "existential",description:"('ex: English there')"},
      {name:"Adadj",value: "ad-adjective in Finnish ",description:"(Derived from adjectives, used only to modify other adjectives)"} 
    ]},
    {name:"Animacy",value: "animacy" ,
    items:[
      {name:"Anim",value: "animate"},
      {name:"Inan",value: "inanimate"},
      {name:"Hum",value: "human"},
      {name:"Nhum",value: "non-human"}
    ]},
    {name:"Aspect",value: "aspect" ,
    items:[
      {name:"Imp",value: "imperfect aspect"},
      {name:"Perf",value: "perfect aspect"},
      {name:"rosp",value: "prospective aspect"},
      {name:"Prog",value: "progressive aspect"},

      {name:"Hab",value: "habitual aspect"},
      {name:"Iter",value: "iterative / frequentative aspect"},
    ]},

    {name:"Case",value: "case",
    items:[
      {name:"Nom",value: "nominative / direct"},
      {name:"Acc",value: "accusative / oblique"},
      {name:"Abs",value: "absolutive"},
      {name:"Erg",value: "ergative"},
      {name:"Dat",value: "dative"},
      {name:"Gen",value: "genitive"},
      {name:"Voc",value: "vocative"},
      {name:"Loc",value: "locative"},
      {name:"Ins",value: "instrumental/instructive"},
      {name:"Par",value: "partitive"},
      {name:"Dis",value: "distributive"},
      {name:"Ess",value: "essive/prolative"},
      {name:"Tra",value: "essive/translative/factive"},
      {name:"Com",value: "comitative/associative"},
      {name:"Abe",value: "abessive"},
      {name:"Ine",value: "inessive"},
      {name:"Ill",value: "illative",description:"(direction into something)"},
      {name:"Ela",value: "elative",description:"(direction out of something)"},
      {name:"Add",value: "additive"},
      {name:"Ade",value: "adessive",description:"(towards something)"},
      {name:"All",value: "allative",description:"(at or on that something)"},
      {name:"Abl",value: "ablative",description:"(direction from some poin)"},
      {name:"Sup",value: "superessive",description:"(on top of something or on the surface of something)"},
      {name:"Sub",value: "sublative",description:"(destination of movement)"},
      {name:"Del",value: "delative",description:" (movement from the surface of something)"},
      {name:"Lat",value: "lative/directional ",description:"allative(movement towards/to/into/onto something)"},
      {name:"Per",value: "perlative",description:"(movement along something)"},
      {name:"Tem",value: "lative/temporal"},
      {name:"Cau",value: "causative/motivative/purposive"},
      {name:"Ter",value: "terminative/terminal allative"},
      {name:"Ben",value: "benefactive/destinative",description:"(English preposition for.)"},
      {name:"Cns",value: "considerative"},
      {name:"Cmp",value: "comparative",description:"(than X)"},
      {name:"Equ",value: "equative ",description:"(same as X)"}
    ]},

    {name:"Clusivity",value: "clusivity",
    items:[
      {name:"In",value: "inclusive",desciption:"Includes the listener, i.e. we = I + you"},
      {name:"Ex",value: "exclusive",desciption:"Excludes the listener, i.e. we = I + they"}
    ]},

    {name:"ConjType",value: "conjunction type",
    items:[
      {name:"Comp",value: "comparing conjunction",desciption:"than ,as"},
      {name:"Oper",value: "mathematical operator",desciption:"plus, minu"}
    ]},

    {name:"Definite",value: "definiteness or state",
    items:[
      {name:"Ind",value: "indefinite",desciption:"indefinite, i.e. any (one) stick"},
      {name:"Spec",value: "specific indefinite",desciption:"a certain stick"},
      {name:"Cons",value: "construct state/reduced definiteness",desciption:"ex: Arabic indefinite state: حلوَةٌ ḥulwatun, construct state: حلوَةُ ḥulwatu "},
      {name:"Def",value: "definite",desciption:"the dog"},
      {name:"Com",value: "complex",desciption:"Used in improper annexation in Arabic"},
    ]},
    {name:"Degree",value: "degree of comparison",
    items:[
      {name:"Pos",value: "positive, first degree",desciption:""},
      {name:"Equ",value: "equative",desciption:"ex:as tall as"},
      {name:"Cmp",value: "comparative, second degree",desciption:"ex:the man is (younger) than me "},
      {name:"Abs",value: "absolute superlative",desciption:"indescribably handsome"},
      {name:"Sup",value: "superlative, third degree",desciption:"his is the (youngest) man in our team"},
    ]},
    {name:"Echo",value: "is this an echo word or a reduplicative?",
    items:[
      {name:"Rdp",value: "reduplicative",desciption:""},
      {name:"Ech",value: "echo",desciption:""}
    ]},
    {name:"Gender[erg]",value: "gender agreement with ergative argument",description:"gender of the ergative argument of the verb",
    items:[
      {name:"Masc",value: "masculine gender"},
      {name:"Fem",value: "feminine gender"}
    ]},

    {name:"Gender[dat]",value: "gender agreement with dative argument",description:"gender of the dative argument of the verb",
    items:[
      {name:"Masc",value: "masculine gender"},
      {name:"Fem",value: "feminine gender"}
    ]},
    {name:"Evident",value: "evidentiality",
    items:[
      {name:"Fh",value: "firsthand",description:"“he/she/it came” (and I was there and saw them coming)"},
      {name:"Nfh",value: "non-firsthand",description:"“he/she/it has come” (I did not witness them coming but I know it because someone told me / because I see that they are there now)"}
    ]},
    {name:"Foreign",value: "is this a foreign word?",
    items:[
      {name:"Yes",value: "it is foreign",description:"He said I could (“dra åt helvete!“)"}
    ]},
    {name:"Gender",value: "gender",
    items:[
      {name:"Masc",value: "masculine gender"},
      {name:"Fem",value: "feminine gender"},
      {name:"Com",value: "common gender"},
      {name:"Neut",value: "neuter gender"},
    ]},
    {name:"Hyph",value: "hyphenated compound or part of it",
    items:[
      {name:"Yes",value: "it is part of hyphenated compound",description:"(anglo)-saxon"}
    ]},
    {name:"Mood",value: " mood",description:"Mood is a feature that expresses modality and subclassifies finite verb forms",
    items:[
      {name:"Ind",value: "indicative"},
      {name:"Imp",value: "imperative"},
      {name:"Cnd",value: "conditional"},
      {name:"Sub",value: "subjunctive/conjunctive"},
      {name:"Jus",value: "jussive/injunctive"},
      {name:"Pot",value: "potential" ,description:"The action of the verb is possible but not certain"},
      {name:"Prp",value: "purposive" ,description:"“in order to”, occurs in Amazonian languages"},
      {name:"Qot",value: "quotative" ,description:"Expresses exclamations like “May you have a long life!”"},
      {name:"Des",value: "desiderative" ,description:"mood corresponds to the modal verb “want to”"},
      {name:"Nec",value: "necessitative" ,description:" mood expresses necessity and corresponds to the modal verbs “must, should, have to”"},
      {name:"Adm",value: "admirative" ,description:"Expresses surprise, irony or doubt. Occurs"},
    ]},
    {name:"NameType",value: "type of named entity",
    items:[
      {name:"Geo",value: "geographical name"},
      {name:"Prs",value: "name of person"},
      {name:"Giv",value: "given name of person"},
      {name:"Sur",value: "surname/family ",description:"name of person"},
      {name:"Nat",value: "nationality"},
      {name:"Com",value: "company, organization" ,description:""},
      {name:"Pro",value: "product" ,description:""},
      {name:"Oth",value: "other" ,description:""}
    ]},


    {name:"NounClass",value: "noun class"},


    {name:"NounType",value: "noun type",
    items:[
      {name:"Class",value: "classifier",description:""}
    ]},

    {name:"NumForm",value: "numeral form",
    items:[
      {name:"Word",value: "number expressed as word"},
      {name:"Digit",value: "number expressed using digits"},
      {name:"Roman",value: "roman numeral"} 
    ]},
    {name:"NumType",value: "numeral type",
    items:[
      {name:"Card",value: "cardinal number ",description:"or corresponding interrogative / relative / indefinite / demonstrative word(one, two, three)"},
      {name:"Ord",value: "ordinal number ",description:"or corresponding interrogative / relative / indefinite / demonstrative word(first, second, third)"},
      {name:"Mult",value: "multiplicative numeral ",description:"or corresponding interrogative / relative / indefinite / demonstrative word(triple,twice)"} ,
      {name:"Frac",value: "fraction"} ,
      {name:"Sets",value: "number of sets of things",description:"collective numeral[pairs of] "} ,
      {name:"Dist",value: "distributive numeral"} ,
      {name:"Range",value: "range of values",description:"two to five"} 
    ]},
    {name:"NumValue",value: "numeric value"},
    {name:"Number",value: "number",
    items:[
      {name:"Sing",value: "singular number"},
      {name:"Plur",value: "plural number"},
      {name:"Dual",value: "dual number"} ,
      {name:"Tri",value: "trial number"} ,
      {name:"Pauc",value: "paucal number",description:"ex: (a few)"} ,
      {name:"Grpa",value: "greater paucal number"} ,
      {name:"Grpl",value: "greater plural number"} ,
      {name:"Inv",value: "inverse number"} ,
      {name:"Ptan",value: "plurale tantum"} ,
      {name:"Coll",value: "collective/mass/singulare tantum"} 
    ]},
    {name:"PartType",value: "particle type"},
    {name:"Person",value: "person",
    items:[
      {name:"0",value: "zero person"},
      {name:"1",value: "first person"},
      {name:"2",value: "second person"} ,
      {name:"3",value: "third person"} ,
      {name:"4",value: "fourth person"} 
    ]},
    {name:"Polarity",value: "polarity",
    items:[
      {name:"Pos",value: "positive, affirmative"},
      {name:"Neg",value: "negative"}
    ]},

    {name:"Polite",value: "politeness",
    items:[
      {name:"Infm",value: "informal register"},
      {name:"Form",value: "formal register"},
      {name:"Elev",value: "referent elevating"} ,
      {name:"Humb",value: "speaker humbling"} 
    ]},

    {name:"Poss",value: "possessive",
    items:[
      {name:"Yes",value: "it is possessive",description:"my, your, his, mine, yours, whose"}
    ]},
    {name:"PossGender",value: "possessor’s gender",
    items:[
      {name:"Masc",value: "masculine possessor"},
      {name:"Fem",value: "feminine possessor"}
    ]},

    {name:"PossNumber",value: "possessor’s number",
    items:[
      {name:"Sing",value: "singular possessor",description:"his, mine"},
      {name:"Plur",value: "plural possessor",description:"our, their"}
    ]},

    {name:"PossPerson",value: "possessor’s person",
    items:[
      {name:"1",value: "first person possessor"},
      {name:"2",value: "second person possessor"},
      {name:"3",value: "third person possessor"}
    ]},

    {name:"PossedNumber",value: "possessed object’s number",
    items:[
      {name:"Sing",value: "singular possessor",description:"his, mine"},
      {name:"Plur",value: "plural possessor",description:"our, their"}
    ]},


    {name:"Prefix",value: "Word functions as a prefix in a compund construction",
    items:[
      {name:"Yes",value: "it is a prefix of a compound"}
    ]},

    {name:"PrepCase",value: "case form sensitive to prepositions",
    items:[
      {name:"Npr",value: "non-prepositional case"},
      {name:"Pre",value: "prepositional case"}
    ]},


    {name:"PronType",value: "pronominal type",
    items:[
      {name:"Prs",value: "personal or possessive",description:"I, you, he, she, it,, mine"},
      {name:"Rcp",value: "reciprocal pronoun",description:"each other"},
      {name:"Art",value: "article",description:"a, an, the"},
      {name:"Int",value: "interrogative pronoun",description:"determiner, numeral or adverb (whose)"},
      {name:"Rel",value: "relative pronoun",description:"determiner, numeral or adverb (which whose)"},
      {name:"Exc",value: "exclamative determiner",description:"(What a) surprise!"},
      {name:"Dem",value: "demonstrative pronoun",description:"determiner, numeral or adverb (so much,that,so many times)"},
      {name:"Emp",value: "emphatic determiner",description:"He (himself) did it."},
      {name:"Tot",value: "total (collective) pronoun",description:"determiner or adverb (every, everybody, everyone)"},
      {name:"Neg",value: "negative pronoun",description:"determiner or adverb (nobody, nothing, none)"},
      {name:"Ind",value: "indefinite pronoun",description:"determiner, numeral or adverb (somebody, something, someone’s )"}
    ]},
    



    {name:"PunctSide",value: "which side of paired punctuation is this?",
    items:[
      {name:"Ini",value: "initial",description:"(left bracket in English texts)"},
      {name:"Fin",value: "final",description:"(right bracket in English texts)"}
    ]},
    {name:"PunctType",value: "punctuation type",
    items:[
      {name:"Peri",value: "period",description:"at the end of sentence; in Penn tagset, includes question and exclamation"},
      {name:"Qest",value: "question mark"},
      {name:"Excl",value: "exclamation mark",description:"!"},
      {name:"Quot",value: "quoation",description:"marks (various sorts in various languages)"},
      {name:"Brck",value: "bracket",description:""},
      {name:"Comm",value: "comma",description:","},
      {name:"Colo",value: "colon",description:"in Penn tagset, “:” is in fact tag for generic other punctuation"},
      {name:"Semi",value: "semicolon",description:";"},
      {name:"Dash",value: "dash, hyphen",description:"_"},
      {name:"Symb",value: "symbol",description:"determiner or adverb (nobody, nothing, none)"}
    ]},

    {name:"Reflex",value: "reflexive",
    items:[
      {name:"Yes",value: "it is reflexive"}
    ]},
    {name:"Style",value: "style or sublanguage to which this word form belongs",
    items:[
      {name:"Arch",value: "archaic, obsolete",description:""},
      {name:"Rare",value: "rare"},
      {name:"Form",value: "formal, literary",description:""},
      {name:"Poet",value: "poetic"},
      {name:"Norm",value: "normal, neutral",description:""},
      {name:"Coll",value: "colloquial",description:""},
      {name:"Vrnc",value: "vernacular",description:""},
      {name:"Slng",value: "slang",description:""},
      {name:"Expr",value: "expressive, emotiona",description:""},
      {name:"Derg",value: "derogative",description:""},
      {name:"Vulg",value: "vulgar",description:""} 
    ]},

    {name:"Subcat",value: "subcategorization",
    items:[
      {name:"Intr",value: "intransitive verb"},
      {name:"Tran",value: "transitive verb"}
    ]},
    {name:"Tense",value: "tense",
    items:[
      {name:"Past",value: "past tense/preterite/aorist"},
      {name:"Pres",value: "present/non-past tense"},
      {name:"Fut",value: "future tense"},
      {name:"Imp",value: "imperfect"},
      {name:"Pqp",value: "pluperfect"} 
    ]},


    {name:"Typo",value: "is this a misspelled word?",
    items:[
      {name:"Yes",value: "it is typo"} 
    ]},

    {name:"VerbForm",value: "form of verb or deverbative",
    items:[
      {name:"Inf",value: "infinitive"},
      {name:"Fin",value: "finite verb"},
      {name:"Sup",value: "supine"},
      {name:"Part",value: "participle,verbal adjective"},
      {name:"Conv:",value: "converb",description:"ransgressive, adverbial participle, verbal adverb (having prepared) the dinner"},
      {name:"Gdv",value: "gerundive"} ,
      {name:"Ger",value: "gerund",description:" I look forward to (seeing) you"} ,
      {name:"Vnoun",value: "verbal noun, masdar",description:" I look forward to (seeing) you"}  
    ]},

    {name:"VerbType",value: "verb type",
    items:[
      {name:"Aux",value: "auxiliary verb"},
      {name:"Cop",value: "copula verb",description:"It (is) purple. He just (became) father"},
      {name:"Mod",value: "modal verb"},
      {name:"Light",value: "light (support) verb",description:""}
    ]},

    {name:"Voice",value: "voice",
    items:[
      {name:"Act",value: "active voice"},
      {name:"Mid",value: "middle voice"},
      {name:"Pass",value: "passive voice"},
      {name:"Antip",value: "antipassive voice"},
      {name:"Dir",value: "direct voice"} ,
      {name:"Inv",value: "inverse voice"} ,
      {name:"Rcp",value: "reciprocal voice"} ,
      {name:"Cau",value: "causative voice"} ,
    ]}
  ]
}
