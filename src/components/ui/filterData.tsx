import { Filter, Search } from "lucide-react";
import { JSX, useState } from "react";
import { Input } from "./input";
import { Select ,
    SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue
} from "./select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Button } from "./button";
interface ResponsiveSearchAndFilterProps {
    searchQuery :  string
    onChange: (term : string)  => void
    sort : string
    setSortOption : (sort : string)  => void
}
export function ResponsiveSearchAndFilter({
    onChange,
    searchQuery,
    setSortOption,
    sort
}  : ResponsiveSearchAndFilterProps)  : JSX.Element{



            return (
              <div className="flex items-center gap-2 md:flex-row flex-col">
                {/* Desktop View */}
                <div className="items-center gap-2 md:flex hidden">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-64 pl-8 bg-card text-card-foreground"
                    />
                  </div>
          
                  {/* Sort Dropdown */}
                  <Select value={sort} onValueChange={(value) => setSortOption(value)}>
                    <SelectTrigger className="w-[180px] bg-card text-card-foreground">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">ALL</SelectItem>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="Top Up">Top Up</SelectItem>
                      <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
          
                {/* Mobile View */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="md:hidden">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter & Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {/* Search Input in Dropdown */}
                    <div className="relative mb-2">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full pl-8 bg-card text-card-foreground"
                      />
                    </div>
          
                    {/* Sort Options in Dropdown */}
                    <DropdownMenuItem onSelect={() => setSortOption("createdAt")}>
                      Date (terbaru)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortOption("createdAtAsc")}>
                      Date (terlama)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortOption("finalAmount")}>
                      Harga (tertinggi)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setSortOption("finalAmountAsc")}>
                      Harga (terendah)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
        
    )
}